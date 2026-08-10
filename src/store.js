/**
 * Smart Skills Store Module with Search & Watcher Integration
 */

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, renderSkill } = require('./parser');
const { getSearchDirectories, detectHarness } = require('./harness');
const { calculateScore } = require('./search');
const { SkillsWatcher } = require('./watcher');

class SkillsStore {
  constructor(enableWatcher = false) {
    this.skills = new Map();
    this.scan();

    if (enableWatcher) {
      this.watcher = new SkillsWatcher(() => this.scan());
      this.watcher.start();
    }
  }

  scan() {
    this.skills.clear();
    const dirs = getSearchDirectories();
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;
      this.scanDir(dir);
    }
  }

  scanDir(dirPath, depth = 0) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(dirPath);
      for (const name of entries) {
        if (name.startsWith('.') && name !== '.claude' && name !== '.cursor' && name !== '.codex') continue;

        const fullPath = path.join(dirPath, name);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            const skillFile = path.join(fullPath, 'SKILL.md');
            if (fs.existsSync(skillFile)) {
              this.addSkillFile(skillFile, name);
            } else {
              this.scanDir(fullPath, depth + 1);
            }
          } else if (stat.isFile() && (name.endsWith('.md') || name.endsWith('.mdc') || name.endsWith('.markdown'))) {
            const skillName = name.replace(/\.(md|mdc|markdown)$/, '');
            this.addSkillFile(fullPath, skillName);
          }
        } catch (e) {}
      }
    } catch (err) {}
  }

  addSkillFile(filePath, defaultName) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const { metadata, body } = parseFrontmatter(raw);
      const name = metadata.name || defaultName;
      const description = metadata.description || body.slice(0, 180).replace(/\n/g, ' ') + '...';
      const harness = detectHarness(filePath);

      this.skills.set(name, {
        name,
        description,
        harness,
        metadata,
        body,
        filePath
      });
    } catch (err) {}
  }

  list(harnessFilter = null) {
    const list = Array.from(this.skills.values());
    if (!harnessFilter) {
      return list.map(s => ({ name: s.name, description: s.description, harness: s.harness, filePath: s.filePath }));
    }
    return list
      .filter(s => s.harness === harnessFilter || harnessFilter === 'all')
      .map(s => ({ name: s.name, description: s.description, harness: s.harness, filePath: s.filePath }));
  }

  search(query, harnessFilter = null) {
    if (!query) return this.list(harnessFilter);
    const results = [];

    for (const s of this.skills.values()) {
      if (harnessFilter && harnessFilter !== 'all' && s.harness !== harnessFilter) continue;

      const score = calculateScore(s, query);
      if (score > 0) {
        results.push({ skill: s, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.map(r => ({
      name: r.skill.name,
      description: r.skill.description,
      harness: r.skill.harness,
      filePath: r.skill.filePath,
      relevanceScore: r.score
    }));
  }

  get(name) {
    const s = this.skills.get(name);
    if (!s) {
      for (const [key, value] of this.skills.entries()) {
        if (key.toLowerCase() === name.toLowerCase()) return value;
      }
      return null;
    }
    return s;
  }

  render(name, args = {}) {
    const skill = this.get(name);
    if (!skill) return null;
    return renderSkill(skill.body, args);
  }
}

module.exports = { SkillsStore };
