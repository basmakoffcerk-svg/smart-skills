#!/bin/bash
set -e

echo "🚀 Installing Smart Skills MCP Server..."

HOME_DIR="${HOME:-/Users/sergei}"
INSTALL_DIR="$HOME_DIR/.gemini/config/smart-skills"
BIN_DIR="$HOME_DIR/.local/bin"
ANTIGRAVITY_MCP_DIR="$HOME_DIR/.gemini/antigravity-ide/mcp/smart-skills"
CONFIG_FILE="$HOME_DIR/.gemini/config/mcp_config.json"
AGENTS_FILE="$HOME_DIR/.gemini/config/AGENTS.md"

# 1. Create target directories & sync files
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "$ANTIGRAVITY_MCP_DIR"
mkdir -p "$HOME_DIR/.gemini/config/skills_bank/claude_skills"

cp -Rf bin src schemas package.json "$INSTALL_DIR/"

# 2. Symlink executables into ~/.local/bin
ln -sfn "$INSTALL_DIR/bin/smart-skills-mcp" "$BIN_DIR/smart-skills-mcp"
ln -sfn "$INSTALL_DIR/bin/smart-skills-mcp" "$BIN_DIR/claude-skills-mcp"
chmod +x "$INSTALL_DIR/bin/smart-skills-mcp"

# 3. Copy MCP JSON schemas
cp -f schemas/*.json "$ANTIGRAVITY_MCP_DIR/"
mkdir -p "$HOME_DIR/.gemini/antigravity-ide/mcp/claude-skills"
cp -f schemas/*.json "$HOME_DIR/.gemini/antigravity-ide/mcp/claude-skills/"

# 4. Update mcp_config.json
if [ -f "$CONFIG_FILE" ]; then
  node -e '
  const fs = require("fs");
  const file = process.argv[1];
  let cfg = { mcpServers: {} };
  try { cfg = JSON.parse(fs.readFileSync(file, "utf8")); } catch(e) {}
  cfg.mcpServers = cfg.mcpServers || {};
  cfg.mcpServers["smart-skills"] = { command: "'"$BIN_DIR"'/smart-skills-mcp" };
  cfg.mcpServers["claude-skills"] = { command: "'"$BIN_DIR"'/smart-skills-mcp" };
  fs.writeFileSync(file, JSON.stringify(cfg, null, 4));
  ' "$CONFIG_FILE"
fi

# 5. Update AGENTS.md global rules
cat << 'EOF' > "$AGENTS_FILE"
# Global Agent Instructions & Customizations

## MANDATORY FIRST STEP: Smart Skills Search & Routing

**CRITICAL DIRECTIVE: On EVERY non-trivial user request (coding, editing, copywriting, design, marketing, SEO, UI/UX, security, architecture, auditing), your VERY FIRST ACTION on step 1 must be to check for an available skill in the MCP skill library.**

### 1. Mandatory Pre-Check (Step 1)
Execute a tool call to `smart-skills` (or `claude-skills`) MCP server:
- `call_mcp_tool` with `ServerName: "smart-skills"`, `ToolName: "search_skills"`, `Arguments: { "query": "<keywords from user prompt>" }`.

### 2. Retrieve & Apply Skill (Step 2)
- If `search_skills` returns a matching skill, call `get_skill(name)` to load the full instructions.
- Follow all guidelines, checklists, and rules provided in the retrieved skill.

### 3. Fallback
- Only proceed without a skill if `search_skills` returns no relevant matches for the query.
EOF

echo "✅ Smart Skills MCP Server installed successfully!"
echo "📍 Installed at: $INSTALL_DIR"
echo "📍 Executable: $BIN_DIR/smart-skills-mcp"
