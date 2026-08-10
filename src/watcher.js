/**
 * Real-Time File System Hot-Reloading Watcher for Smart Skills
 */

const fs = require('fs');
const { getSearchDirectories } = require('./harness');

class SkillsWatcher {
  constructor(onReload) {
    this.onReload = onReload;
    this.watchers = [];
    this.debounceTimer = null;
  }

  start() {
    this.stop();
    const dirs = getSearchDirectories();

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) return;
      try {
        const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.md') || filename.endsWith('.mdc') || filename.endsWith('.json'))) {
            this.triggerReload();
          }
        });
        this.watchers.push(watcher);
      } catch (e) {
        // Non-recursive fallback if recursive watch fails on some platforms
      }
    });
  }

  triggerReload() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (typeof this.onReload === 'function') {
        this.onReload();
      }
    }, 300);
  }

  stop() {
    this.watchers.forEach(w => {
      try { w.close(); } catch (e) {}
    });
    this.watchers = [];
  }
}

module.exports = { SkillsWatcher };
