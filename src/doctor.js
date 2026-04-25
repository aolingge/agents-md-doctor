import fs from 'node:fs'
import path from 'node:path'

const checks = [
  {
    id: 'purpose',
    weight: 1,
    test: (text) => /#\s*agents\.md|ai agent|coding agent|codex|claude|cursor/i.test(text),
    pass: 'Explains that the file is for AI coding agents',
    fail: 'Add a short purpose statement for AI coding agents.',
  },
  {
    id: 'read-order',
    weight: 1,
    test: (text) => /read order|read first|start here|先读|读取顺序/i.test(text),
    pass: 'Defines where agents should start reading',
    fail: 'Add a read order section: AGENTS.md, README, build files, then local docs.',
  },
  {
    id: 'build-test',
    weight: 1.5,
    test: (text) => /(npm|pnpm|yarn|pytest|mvn|gradle|go test|cargo test|make).{0,40}(test|build|lint|check)|验证|测试|构建/i.test(text),
    pass: 'Includes concrete build/test/lint commands',
    fail: 'List exact commands an agent should run before finishing.',
  },
  {
    id: 'boundaries',
    weight: 1,
    test: (text) => /do not|never|avoid|不要|禁止|不得|scope|boundary|边界/i.test(text),
    pass: 'Defines editing boundaries',
    fail: 'Add boundaries: what files are safe to edit and what must be avoided.',
  },
  {
    id: 'secrets',
    weight: 1,
    test: (text) => /secret|token|cookie|credential|api key|密钥|令牌|凭据/i.test(text),
    pass: 'Mentions secret and credential handling',
    fail: 'Add a rule that agents must not expose secrets, cookies, tokens, or private logs.',
  },
  {
    id: 'git-workflow',
    weight: 1,
    test: (text) => /git status|pull request|commit|branch|dirty|worktree|提交|分支/i.test(text),
    pass: 'Mentions git workflow and dirty worktree handling',
    fail: 'Tell agents to check git status and avoid reverting unrelated user changes.',
  },
  {
    id: 'project-map',
    weight: 1,
    test: (text) => /layout|structure|directory|folder|repo|目录|结构|项目/i.test(text),
    pass: 'Provides project structure hints',
    fail: 'Add a small project map so agents can find important files quickly.',
  },
  {
    id: 'no-fake-certainty',
    weight: 0.8,
    test: (text) => /verify|verified|run|evidence|验证|证据|运行/i.test(text),
    pass: 'Asks agents to verify claims',
    fail: 'Add a verification rule so agents report what they actually ran.',
  },
]

const secretPattern = /(github_pat_|ghp_|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16})/

export function findAgentsFile(cwd = process.cwd()) {
  const names = ['AGENTS.md', 'agents.md']
  for (const name of names) {
    const candidate = path.join(cwd, name)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

export function diagnoseAgentsMd(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const results = []

  for (const check of checks) {
    const ok = check.test(text)
    results.push({
      status: ok ? 'PASS' : 'FAIL',
      check: check.id,
      message: ok ? check.pass : check.fail,
      weight: check.weight,
    })
  }

  if (secretPattern.test(text)) {
    results.push({
      status: 'FAIL',
      check: 'leaked-secret',
      message: 'Secret-like value found in AGENTS.md. Remove it before publishing.',
      weight: 2,
    })
  }

  const total = results.reduce((sum, item) => sum + item.weight, 0)
  const earned = results.reduce((sum, item) => sum + (item.status === 'PASS' ? item.weight : 0), 0)
  const score = Math.round((earned / total) * 100)

  return { file: filePath, score, results }
}

export function formatText(report) {
  const lines = [`AGENTS.md score: ${report.score}/100`, `File: ${report.file}`, '']
  for (const result of report.results) {
    lines.push(`${result.status.padEnd(5)} ${result.check.padEnd(16)} ${result.message}`)
  }
  return lines.join('\n')
}

export function formatMarkdown(report) {
  const rows = report.results
    .map((result) => `| ${result.status} | ${result.check} | ${result.message} |`)
    .join('\n')
  return `# AGENTS.md Doctor Report

Score: **${report.score}/100**

File: \`${report.file}\`

| Status | Check | Message |
| --- | --- | --- |
${rows}
`
}

export function formatAnnotations(report) {
  return report.results
    .filter((result) => result.status !== 'PASS')
    .map((result) => `::warning file=${report.file},title=${result.check}::${result.message}`)
    .join('\n')
}

export function formatSarif(report) {
  return {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: { driver: { name: 'agents-md-doctor', informationUri: 'https://github.com/aolingge/agents-md-doctor' } },
        results: report.results
          .filter((result) => result.status !== 'PASS')
          .map((result) => ({
            ruleId: result.check,
            level: 'warning',
            message: { text: result.message },
            locations: [{ physicalLocation: { artifactLocation: { uri: report.file } } }],
          })),
      },
    ],
  }
}
