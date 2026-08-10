/**
 * Stdio JSON-RPC MCP Server Module
 */

const readline = require('readline');
const { SkillsStore } = require('./store');

function startServer() {
  const store = new SkillsStore();

  if (process.argv.includes('--test')) {
    console.log('=== Smart Skills MCP Server ===');
    console.log(`Total indexed skills across all harnesses: ${store.list().length}`);
    console.log('Sample indexed skills:', store.list().slice(0, 15));
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  function sendResponse(id, result, error = null) {
    const resp = { jsonrpc: '2.0', id };
    if (error) {
      resp.error = error;
    } else {
      resp.result = result;
    }
    process.stdout.write(JSON.stringify(resp) + '\n');
  }

  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const req = JSON.parse(line);
      const { id, method, params } = req;

      if (method === 'initialize') {
        sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'smart-skills-mcp', version: '1.0.0' }
        });
        return;
      }

      if (method === 'tools/list') {
        sendResponse(id, {
          tools: [
            {
              name: 'list_skills',
              description: 'List all available skills across all AI harnesses (Claude, Codex, Cursor, Antigravity, Windsurf)',
              inputSchema: {
                type: 'object',
                properties: {
                  harness: { type: 'string', description: 'Filter by harness (claude-code, codex, cursor, antigravity, windsurf, generic)' }
                }
              }
            },
            {
              name: 'search_skills',
              description: 'Search skills by keyword across all AI harnesses',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search term or keyword' },
                  harness: { type: 'string', description: 'Optional harness filter' }
                },
                required: ['query']
              }
            },
            {
              name: 'get_skill',
              description: 'Retrieve full prompt instructions and details for a specific skill',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Exact name of the skill' }
                },
                required: ['name']
              }
            },
            {
              name: 'sync_skills',
              description: 'Re-scan all harness directories and update skill index',
              inputSchema: { type: 'object', properties: {} }
            }
          ]
        });
        return;
      }

      if (method === 'tools/call') {
        const { name, arguments: args } = params || {};

        if (name === 'list_skills') {
          const harness = args ? args.harness : null;
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(store.list(harness), null, 2) }]
          });
          return;
        }

        if (name === 'search_skills') {
          const query = args ? args.query : '';
          const harness = args ? args.harness : null;
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(store.search(query, harness), null, 2) }]
          });
          return;
        }

        if (name === 'get_skill') {
          const skillName = args ? args.name : '';
          const skill = store.get(skillName);
          if (!skill) {
            sendResponse(id, {
              content: [{ type: 'text', text: `Skill "${skillName}" not found.` }],
              isError: true
            });
          } else {
            sendResponse(id, {
              content: [{
                type: 'text',
                text: `### Skill: ${skill.name}\n**Harness**: ${skill.harness}\n**File**: ${skill.filePath}\n\n---\n\n${skill.body}`
              }]
            });
          }
          return;
        }

        if (name === 'sync_skills') {
          store.scan();
          sendResponse(id, {
            content: [{ type: 'text', text: `Successfully re-indexed skills across all harnesses. Total available: ${store.list().length}` }]
          });
          return;
        }

        sendResponse(id, null, { code: -32601, message: `Tool ${name} not found` });
        return;
      }

      if (id !== undefined) sendResponse(id, {});
    } catch (err) {}
  });
}

module.exports = { startServer };
