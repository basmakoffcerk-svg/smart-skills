# 🧠 Smart Skills MCP Server

> **Universal Multi-Harness Skills MCP Server for AI Coding Agents**  
> (Google Antigravity IDE, Claude Code, OpenAI Codex, Cursor, Windsurf, Aider)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-orange.svg)](https://modelcontextprotocol.io)

[**Русская документация / Read in Russian**](README.ru.md)

---

## ⚡ Overview

**Smart Skills MCP** is a lightweight, zero-daemon Model Context Protocol (MCP) server that empowers AI agents to search, discover, and load specialized skills and prompts **on demand**, without polluting the AI agent's initial context window.

It features **Universal Multi-Harness Discovery** across all major AI coding frameworks:
- 🔵 **Google Antigravity IDE & Gemini**
- 🟣 **Claude Code**
- 🟢 **OpenAI Codex**
- 🟤 **Cursor & Windsurf**

---

## 🚀 Key Features

- **Zero-Token Bloat**: Keeps 100+ or 1000+ skills in a local library. Only loads the exact instructions required for the current prompt.
- **Universal Multi-Harness Scanner**: Automatically scans and detects skills across `.claude/skills`, `.codex/skills`, `.cursor/rules`, `.agents/skills`, and `~/.gemini/config/skills_bank/`.
- **Real-Time Hot Reloading**: Automatically re-indexes skill files as soon as `.md` files are added or modified via `fs.watch`.
- **Template & Argument Rendering**: Supports parameter substitution for `$1`, `$ARGUMENTS`, `{{target}}` via `render_skill` MCP tool.
- **CLI Management Suite**: Command-line tool `smart-skills-mcp` with `add`, `update`, `list`, and `lint` commands.
- **Fast Stdio JSON-RPC**: Runs natively via Node.js Stdio process transport. Zero network ports opened.

---

## 🛠️ Architecture

```
User Prompt --> AI Agent (Antigravity/Codex)
                     |
                     v (1. Step 1 Pre-Check)
         smart-skills MCP Server
                     |
         +-----------+-----------+
         |                       |
   Skill Index             Local Storage
(Claude, Codex,      (~/.gemini/config/skills_bank/
 Cursor, Antigravity)  ~/.claude/skills/)
         |                       |
         +-----------+-----------+
                     |
                     v (2. Return exact SKILL.md)
              AI Agent Execution
```

---

## 📦 Installation

```bash
git clone https://github.com/basmakoffcerk-svg/smart-skills.git
cd smart-skills
bash install.sh
```

---

## 🧪 Testing & CLI Usage

Run the automated test suite:

```bash
npm test
```

Or run the skill linter:

```bash
node bin/smart-skills-mcp lint
```

---

## 🛠️ Provided MCP Tools

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_skills` | Search skills by query across all harnesses | `query` (string, required), `harness` (string, optional) |
| `get_skill` | Retrieve full instructions for a skill | `name` (string, required) |
| `render_skill` | Retrieve skill instructions with argument substitution | `name` (string, required), `arguments` (object, optional) |
| `list_skills` | List all indexed skills | `harness` (string, optional) |
| `sync_skills` | Force re-index of skill directories | None |

---

## 📄 License

[MIT License](LICENSE) © 2026 basmakoffcerk-svg & Smart Skills Authors
