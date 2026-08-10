const assert = require('assert');
const { SkillsStore } = require('../src/store');
const { parseFrontmatter } = require('../src/parser');
const { detectHarness } = require('../src/harness');

console.log('🧪 Running smart-skills Test Suite...');

// Test 1: Parser
const sampleRaw = `---
name: test-skill
description: A test skill for unit testing
---

# Instructions
Do testing clean.`;

const parsed = parseFrontmatter(sampleRaw);
assert.strictEqual(parsed.metadata.name, 'test-skill');
assert.strictEqual(parsed.metadata.description, 'A test skill for unit testing');
console.log('✅ Frontmatter parser test passed.');

// Test 2: Harness detection
assert.strictEqual(detectHarness('/Users/test/.claude/skills/demo/SKILL.md'), 'claude-code');
assert.strictEqual(detectHarness('/Users/test/.codex/skills/demo/SKILL.md'), 'codex');
assert.strictEqual(detectHarness('/Users/test/.cursor/rules/demo.mdc'), 'cursor');
assert.strictEqual(detectHarness('/Users/test/.gemini/config/skills/demo/SKILL.md'), 'antigravity');
console.log('✅ Harness detector test passed.');

// Test 3: Store scanning & listing
const store = new SkillsStore();
const allSkills = store.list();
assert.ok(Array.isArray(allSkills));
console.log(`✅ SkillsStore scanned ${allSkills.length} total skills.`);

console.log('🎉 All tests passed successfully!');
