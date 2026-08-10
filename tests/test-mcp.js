const assert = require('assert');
const { SkillsStore } = require('../src/store');
const { parseFrontmatter, renderSkill } = require('../src/parser');
const { detectHarness } = require('../src/harness');
const { calculateScore } = require('../src/search');

console.log('🧪 Running smart-skills Expanded Test Suite...');

// Test 1: Parser & Frontmatter
const sampleRaw = `---
name: test-skill
description: A test skill for unit testing
---

# Instructions for $1
Do {{action}} on target $ARGUMENTS.`;

const parsed = parseFrontmatter(sampleRaw);
assert.strictEqual(parsed.metadata.name, 'test-skill');
assert.strictEqual(parsed.metadata.description, 'A test skill for unit testing');
console.log('✅ Frontmatter parser test passed.');

// Test 2: Template Rendering
const rendered = renderSkill(parsed.body, { $ARGUMENTS: 'src/main.js', 1: 'src/main.js', action: 'refactoring' });
assert.ok(rendered.includes('Instructions for src/main.js'));
assert.ok(rendered.includes('Do refactoring on target src/main.js'));
console.log('✅ Template rendering (renderSkill) test passed.');

// Test 3: Harness detection
assert.strictEqual(detectHarness('/Users/test/.claude/skills/demo/SKILL.md'), 'claude-code');
assert.strictEqual(detectHarness('/Users/test/.codex/skills/demo/SKILL.md'), 'codex');
assert.strictEqual(detectHarness('/Users/test/.cursor/rules/demo.mdc'), 'cursor');
assert.strictEqual(detectHarness('/Users/test/.gemini/config/skills/demo/SKILL.md'), 'antigravity');
console.log('✅ Harness detector test passed.');

// Test 4: Search scoring
const mockSkill = {
  name: 'cold-email',
  description: 'Write B2B cold outreach emails',
  metadata: { tags: 'email sales' },
  body: 'Cold email tips'
};
const score = calculateScore(mockSkill, 'cold email');
assert.ok(score > 50);
console.log('✅ Relevance search engine scoring test passed.');

// Test 5: Store scanning & listing
const store = new SkillsStore();
const allSkills = store.list();
assert.ok(Array.isArray(allSkills));
console.log(`✅ SkillsStore scanned ${allSkills.length} total skills.`);

console.log('🎉 All tests passed successfully!');
