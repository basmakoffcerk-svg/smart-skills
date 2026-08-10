/**
 * Harness Discovery & Detection Module
 */

const path = require('path');
const fs = require('fs');

const HOME = process.env.HOME || '/Users/sergei';
const CWD = process.cwd();

function getSearchDirectories() {
  const dirs = [
    // Antigravity & Gemini
    path.join(HOME, '.gemini/config/skills_bank/claude_skills'),
    path.join(HOME, '.gemini/config/skills'),
    path.join(HOME, '.gemini/config/repos'),

    // Claude Code
    path.join(HOME, '.claude/skills'),
    path.join(HOME, '.claude/commands'),
    path.join(CWD, '.claude/skills'),
    path.join(CWD, '.claude/commands'),

    // Codex
    path.join(HOME, '.codex/skills'),
    path.join(HOME, '.codex/prompts'),
    path.join(CWD, '.codex/skills'),

    // Cursor
    path.join(HOME, '.cursor/skills'),
    path.join(HOME, '.cursor/rules'),
    path.join(CWD, '.cursor/rules'),
    path.join(CWD, '.cursor/skills'),

    // Windsurf & General Agents
    path.join(HOME, '.windsurf/skills'),
    path.join(HOME, '.agents/skills'),
    path.join(CWD, '.agents/skills')
  ];

  if (process.env.SKILLS_PATH) {
    process.env.SKILLS_PATH.split(':').forEach(p => {
      if (p.trim()) dirs.push(path.resolve(p.trim()));
    });
  }

  const configFile = path.join(HOME, '.gemini/config/skills_config.json');
  if (fs.existsSync(configFile)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (Array.isArray(cfg.extra_dirs)) {
        cfg.extra_dirs.forEach(p => dirs.push(path.resolve(p)));
      }
    } catch (e) {}
  }

  return Array.from(new Set(dirs));
}

function detectHarness(filePath) {
  if (filePath.includes('.claude')) return 'claude-code';
  if (filePath.includes('.codex')) return 'codex';
  if (filePath.includes('.cursor')) return 'cursor';
  if (filePath.includes('.windsurf')) return 'windsurf';
  if (filePath.includes('.gemini') || filePath.includes('.agents')) return 'antigravity';
  return 'generic';
}

module.exports = { getSearchDirectories, detectHarness };
