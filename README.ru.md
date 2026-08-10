# 🧠 Smart Skills MCP Server

> **Универсальный мульти-харнесс MCP-сервер скиллов для AI-агентов**  
> (Google Antigravity IDE, Claude Code, OpenAI Codex, Cursor, Windsurf, Aider)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-orange.svg)](https://modelcontextprotocol.io)

---

## ⚡ Обзор

**Smart Skills MCP** — это легкий MCP-сервер (Model Context Protocol), позволяющий AI-ассистентам динамически искать и подгружать узкоспециализированные скиллы и инструкции **по требованию**, не перегружая стартовый токен-бюджет модели.

Сервер поддерживает **универсальное сканирование всех AI-харнессов**:
- 🔵 **Google Antigravity IDE & Gemini**
- 🟣 **Claude Code**
- 🟢 **OpenAI Codex**
- 🟤 **Cursor & Windsurf**

---

## 🚀 Основные возможности

- **Нулевой расход токенов вхолостую**: Храните 100+ или 1000+ скиллов в локальном хранилище. Модель подгружает строго ту инструкцию, которая нужна для текущего промпта.
- **Мульти-харнесс сканер**: Автоматически просматривает директории `.claude/skills`, `.codex/skills`, `.cursor/rules`, `.agents/skills`, `~/.gemini/config/skills_bank/` и локальные репозитории.
- **Безопасный Stdio транспорт**: Запускается локально через Node.js процессы. Не открывает сетевых портов и не отправляет данные в сеть.
- **Универсальный парсер**: Считывает YAML frontmatter, Markdown заголовки (`# Skill Name`), файлы правил `.mdc` и стандартные `.md`.
- **Установка в 1 клик**: Включает готовый скрипт `install.sh` для быстрой интеграции в Antigravity IDE, Claude Code, Codex и Cursor.

---

## 📦 Быстрая установка

```bash
git clone https://github.com/your-username/smart-skills.git
cd smart-skills
bash install.sh
```

---

## 🧪 Тестирование

Запуск встроенного тест-сюита:

```bash
npm test
```

Тестирование CLI индексатора:

```bash
npm start -- --test
```

---

## 🛠️ Предоставляемые MCP-инструменты

| Инструмент | Описание | Параметры |
| :--- | :--- | :--- |
| `search_skills` | Поиск скиллов по ключевым словам | `query` (строка, обязательно), `harness` (строка, опционально) |
| `get_skill` | Загрузка полной инструкции скилла | `name` (строка, обязательно) |
| `list_skills` | Получение списка всех скиллов | `harness` (строка, опционально) |
| `sync_skills` | Переиндексация директорий | Без параметров |

---

## 📄 Лицензия

[MIT License](LICENSE) © 2026 Sergei & Smart Skills Authors
