import test from 'node:test'
import assert from 'node:assert/strict'
import { diagnoseAgentsMd } from '../src/doctor.js'

test('good fixture scores higher than weak fixture', () => {
  const good = diagnoseAgentsMd('fixtures/good/AGENTS.md')
  const weak = diagnoseAgentsMd('fixtures/weak/AGENTS.md')
  assert.ok(good.score > weak.score)
  assert.ok(good.score >= 90)
  assert.ok(weak.score < 40)
})

test('weak fixture reports missing build-test guidance', () => {
  const weak = diagnoseAgentsMd('fixtures/weak/AGENTS.md')
  assert.ok(weak.results.some((result) => result.check === 'build-test' && result.status === 'FAIL'))
})

