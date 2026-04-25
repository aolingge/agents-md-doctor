<p align="center">
  <img src="assets/readme-banner.svg" alt="AGENTS.md Doctor banner" width="100%">
</p>

<h1 align="center">AGENTS.md Doctor</h1>

<p align="center">
  一个零依赖 CLI，用来检查你的 <code>AGENTS.md</code> 是否真的适合 Codex、Claude Code、Cursor 等 AI 编程 Agent 使用。
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="#快速开始">快速开始</a> · <a href="#检查项">检查项</a>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D18-10B981">
  <img alt="dependencies" src="https://img.shields.io/badge/dependencies-0-F59E0B">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-6366F1">
</p>

## 为什么做这个

`AGENTS.md` 正在变成 AI 编程 Agent 的仓库级说明书。问题是很多文件只写“注意安全、认真修改”，但没有告诉 Agent 先读什么、跑什么命令、哪些地方不能动、怎么处理密钥。

这个工具会给你的 Agent 说明书打一个可操作的准备度分数。

## 快速开始

```bash
npx github:aolingge/agents-md-doctor
```

检查指定文件：

```bash
npx github:aolingge/agents-md-doctor --path AGENTS.md --min-score 80
```

生成报告：

```bash
npx github:aolingge/agents-md-doctor --path AGENTS.md --markdown > agents-report.md
```

## 检查项

| 检查 | 看什么 |
| --- | --- |
| Purpose | 是否说明这是给 AI 编程 Agent 用的 |
| Read order | Agent 应该从哪里开始读 |
| Build/test commands | 是否有明确命令，而不是空泛建议 |
| Editing boundaries | 哪些文件能动、哪些不能动 |
| Secret handling | token、cookie、凭据、私有日志 |
| Git workflow | 脏工作区和无关改动处理 |
| Project map | 关键目录和文件 |
| Verification | 收尾时要报告真实跑过的验证 |

## 输出示例

```text
AGENTS.md score: 94/100
File: AGENTS.md

PASS  purpose          Explains that the file is for AI coding agents
PASS  read-order       Defines where agents should start reading
PASS  build-test       Includes concrete build/test/lint commands
FAIL  verification     Add a verification rule so agents report what they actually ran.
```

## 参与贡献

Issue 会故意拆得很小，适合新手 PR：新增检查项、优化提示语、补真实仓库 fixture、补不同 Agent 工具的说明。

## License

MIT


## Quality Gate

Use this project as a repeatable gate before an AI agent marks work as done:

- [Quality gate guide](docs/quality-gates.md)
- [Copy-ready GitHub Actions example](examples/github-action.yml)

