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

## 🚀 Features

- **Zero-Token Bloat**: Keeps 100+ or 1000+ skills in a local library. Only loads the exact instructions required for the current prompt.
- **Universal Multi-Harness Scanner**: Automatically scans and detects skills across `.claude/skills`, `.codex/skills`, `.cursor/rules`, `.agents/skills`, and `~/.gemini/config/skills_bank/`.
- **Fast Stdio JSON-RPC**: Runs natively via Node.js Stdio process transport. Zero network ports opened.
- **Automatic Metadata & Frontmatter Parsing**: Parses YAML frontmatter, Markdown headings, `.mdc` rules, and standalone markdown files.
- **One-Click Installation**: Includes `install.sh` for instant setup in Antigravity IDE, Claude Code, Codex, and Cursor.

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
git clone https://github.com/your-username/smart-skills.git
cd smart-skills
bash install.sh
```

---

## 🧪 Testing

Run the automated test suite:

```bash
npm test
```

Or test the MCP Stdio scanner directly:

```bash
npm start -- --test
```

---

## 🛠️ Provided MCP Tools

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `search_skills` | Search skills by query across all harnesses | `query` (string, required), `harness` (string, optional) |
| `get_skill` | Retrieve full instructions for a skill | `name` (string, required) |
| `list_skills` | List all indexed skills | `harness` (string, optional) |
| `sync_skills` | Force re-index of skill directories | None |

---

## 📄 License

[MIT License](LICENSE) © 2026 Sergei & Smart Skills Authors
