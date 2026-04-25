#!/usr/bin/env node
import process from 'node:process'
import { diagnoseAgentsMd, findAgentsFile, formatMarkdown, formatText } from './doctor.js'

function parseArgs(argv) {
  const args = { path: null, minScore: 70, json: false, markdown: false, help: false }
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (item === '--path') args.path = argv[++index]
    else if (item === '--min-score') args.minScore = Number(argv[++index])
    else if (item === '--json') args.json = true
    else if (item === '--markdown') args.markdown = true
    else if (item === '-h' || item === '--help') args.help = true
    else throw new Error(`Unknown option: ${item}`)
  }
  return args
}

function help() {
  console.log(`agents-md-doctor

Usage:
  agents-md-doctor
  agents-md-doctor --path AGENTS.md
  agents-md-doctor --path AGENTS.md --markdown

Options:
  --path FILE       AGENTS.md path, auto-detected by default
  --min-score N    fail below score, default: 70
  --json           print JSON report
  --markdown       print Markdown report
`)
}

try {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    help()
    process.exit(0)
  }
  const file = args.path ?? findAgentsFile()
  if (!file) throw new Error('No AGENTS.md found. Pass --path path/to/AGENTS.md')
  const report = diagnoseAgentsMd(file)
  if (args.json) console.log(JSON.stringify(report, null, 2))
  else if (args.markdown) console.log(formatMarkdown(report))
  else console.log(formatText(report))
  process.exit(report.score >= args.minScore ? 0 : 1)
} catch (error) {
  console.error(`agents-md-doctor: ${error.message}`)
  process.exit(2)
}

