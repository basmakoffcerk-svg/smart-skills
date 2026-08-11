/**
 * CLI Management & Skill Linter Suite for Smart Skills
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { SkillsStore } = require('./store');
const { parseFrontmatter } = require('./parser');

const HOME = process.env.HOME || '/Users/sergei';
const REPOS_DIR = path.join(HOME, '.gemini/config/repos');
const SKILLS_BANK_DIR = path.join(HOME, '.gemini/config/skills_bank/claude_skills');

function handleCliCommands(args) {
  const command = args[0];

  if (command === 'add') {
    const gitUrl = args[1];
    if (!gitUrl) {
      console.error('❌ Error: Please provide a Git repository URL.');
      console.log('Usage: smart-skills add <git-url>');
      process.exit(1);
    }
    addRepository(gitUrl);
    process.exit(0);
  }

  if (command === 'update') {
    updateRepositories();
    process.exit(0);
  }

  if (command === 'list') {
    listInstalledSkills();
    process.exit(0);
  }

  if (command === 'lint') {
    lintSkills();
    process.exit(0);
  }
}

function addRepository(gitUrl) {
  console.log(`📦 Cloning repository: ${gitUrl}...`);
  fs.mkdirSync(REPOS_DIR, { recursive: true });
  fs.mkdirSync(SKILLS_BANK_DIR, { recursive: true });

  const repoName = path.basename(gitUrl, '.git');
  const targetDir = path.join(REPOS_DIR, repoName);

  if (fs.existsSync(targetDir)) {
    console.log(`⚠️ Repository ${repoName} already exists in ${targetDir}. Pulling latest...`);
    try {
      execSync(`git -C "${targetDir}" pull`, { stdio: 'inherit' });
    } catch (e) {}
  } else {
    execSync(`git clone "${gitUrl}" "${targetDir}"`, { stdio: 'inherit' });
  }

  let linkedCount = 0;

  // Check if root directory itself is a single SKILL.md repository
  if (fs.existsSync(path.join(targetDir, 'SKILL.md'))) {
    const linkPath = path.join(SKILLS_BANK_DIR, repoName);
    try {
      fs.symlinkSync(targetDir, linkPath, 'dir');
      linkedCount++;
    } catch (e) {
      // Link exists
    }
  } else {
    // Multi-skill repository
    const skillsSubdir = fs.existsSync(path.join(targetDir, 'skills')) ? path.join(targetDir, 'skills') : targetDir;
    const entries = fs.readdirSync(skillsSubdir);
    for (const name of entries) {
      if (name.startsWith('.')) continue;
      const fullPath = path.join(skillsSubdir, name);
      if (fs.statSync(fullPath).isDirectory()) {
        const linkPath = path.join(SKILLS_BANK_DIR, name);
        try {
          fs.symlinkSync(fullPath, linkPath, 'dir');
          linkedCount++;
        } catch (e) {
          // Link exists
        }
      }
    }
  }

  console.log(`✅ Successfully added ${repoName} and linked ${linkedCount} skill(s)!`);
}

function updateRepositories() {
  console.log('🔄 Checking updates for installed skill repositories...');
  if (!fs.existsSync(REPOS_DIR)) {
    console.log('No tracked repositories found.');
    return;
  }

  const entries = fs.readdirSync(REPOS_DIR);
  let updated = 0;
  for (const dir of entries) {
    const repoPath = path.join(REPOS_DIR, dir);
    if (fs.existsSync(path.join(repoPath, '.git'))) {
      console.log(`Updating ${dir}...`);
      try {
        execSync(`git -C "${repoPath}" pull`, { stdio: 'inherit' });
        updated++;
      } catch (e) {
        console.error(`❌ Failed to update ${dir}`);
      }
    }
  }
  console.log(`✅ Update complete. ${updated} repositories processed.`);
}

function listInstalledSkills() {
  const store = new SkillsStore();
  const skills = store.list(null, 1000);
  console.log(`\n📚 Total Installed Skills: ${skills.length}\n`);

  const byHarness = {};
  skills.forEach(s => {
    byHarness[s.harness] = byHarness[s.harness] || [];
    byHarness[s.harness].push(s);
  });

  for (const [harness, list] of Object.entries(byHarness)) {
    console.log(`\n--- Harness: ${harness.toUpperCase()} (${list.length} skills) ---`);
    list.forEach(s => {
      console.log(` • ${s.name.padEnd(30)} - ${s.description.slice(0, 70)}...`);
    });
  }
}

function lintSkills() {
  console.log('🔍 Linting installed skill files...\n');
  const store = new SkillsStore();
  const skills = store.list(null, 1000);
  let errors = 0;
  let warnings = 0;

  const namesSeen = new Set();

  skills.forEach(s => {
    if (namesSeen.has(s.name.toLowerCase())) {
      console.log(`⚠️ WARNING: Duplicate skill name detected: "${s.name}" (${s.filePath})`);
      warnings++;
    } else {
      namesSeen.add(s.name.toLowerCase());
    }

    if (!s.description || s.description.length < 10) {
      console.log(`❌ ERROR: Skill "${s.name}" has missing or short description. (${s.filePath})`);
      errors++;
    }
  });

  console.log(`\n🏁 Linting Finished. Errors: ${errors}, Warnings: ${warnings}`);
}

module.exports = { handleCliCommands };
