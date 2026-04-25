#!/usr/bin/env node
import process from 'node:process'
import { diagnoseAgentsMd, findAgentsFile, formatAnnotations, formatMarkdown, formatSarif, formatText } from './doctor.js'

const VERSION = '0.1.0'

function parseArgs(argv) {
  const args = { path: null, minScore: 70, json: false, markdown: false, sarif: false, annotations: false, help: false, version: false }
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (item === '--path') args.path = argv[++index]
    else if (item === '--min-score') args.minScore = Number(argv[++index])
    else if (item === '--json') args.json = true
    else if (item === '--markdown') args.markdown = true
    else if (item === '--sarif') args.sarif = true
    else if (item === '--annotations') args.annotations = true
    else if (item === '--version') args.version = true
    else if (item === '-h' || item === '--help') args.help = true
    else throw new Error(`Unknown option: ${item}`)
  }
  return args
}

function help() {
  console.log(`agents-md-doctor v${VERSION}

Usage:
  agents-md-doctor
  agents-md-doctor --path AGENTS.md
  agents-md-doctor --path AGENTS.md --markdown

Options:
  --path FILE       AGENTS.md path, auto-detected by default
  --min-score N    fail below score, default: 70
  --json           print JSON report
  --markdown       print Markdown report
  --sarif          print SARIF 2.1.0 report
  --annotations    print GitHub Actions warnings
  --version        print version
`)
}

try {
  const args = parseArgs(process.argv.slice(2))
  if (args.version) {
    console.log(VERSION)
    process.exit(0)
  }
  if (args.help) {
    help()
    process.exit(0)
  }
  const file = args.path ?? findAgentsFile()
  if (!file) throw new Error('No AGENTS.md found. Pass --path path/to/AGENTS.md')
  const report = diagnoseAgentsMd(file)
  if (args.json) console.log(JSON.stringify(report, null, 2))
  else if (args.markdown) console.log(formatMarkdown(report))
  else if (args.sarif) console.log(JSON.stringify(formatSarif(report), null, 2))
  else if (args.annotations) console.log(formatAnnotations(report))
  else console.log(formatText(report))
  process.exit(report.score >= args.minScore ? 0 : 1)
} catch (error) {
  console.error(`agents-md-doctor: ${error.message}`)
  process.exit(2)
}
