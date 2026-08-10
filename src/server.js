/**
 * Stdio JSON-RPC MCP Server Module
 */

const readline = require('readline');
const { SkillsStore } = require('./store');

function startServer() {
  const store = new SkillsStore(true);

  if (process.argv.includes('--test')) {
    console.log('=== Smart Skills MCP Server ===');
    console.log(`Total indexed skills across all harnesses: ${store.list(null, 1000).length}`);
    console.log('Sample indexed skills (limited to 5):', store.list(null, 5));
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
          serverInfo: { name: 'smart-skills-mcp', version: '1.2.0' }
        });
        return;
      }

      if (method === 'tools/list') {
        sendResponse(id, {
          tools: [
            {
              name: 'list_skills',
              description: 'List available skills across AI harnesses with compact pagination',
              inputSchema: {
                type: 'object',
                properties: {
                  harness: { type: 'string', description: 'Filter by harness (claude-code, codex, cursor, antigravity, windsurf, generic)' },
                  limit: { type: 'number', description: 'Number of items to return (default 20, max 50)' },
                  offset: { type: 'number', description: 'Offset index for pagination' }
                }
              }
            },
            {
              name: 'search_skills',
              description: 'Search skills by keyword across all AI harnesses (returns top 5-10 relevant matches)',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search term or keyword' },
                  harness: { type: 'string', description: 'Optional harness filter' },
                  limit: { type: 'number', description: 'Max matches to return (default 5, max 15)' }
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
              name: 'render_skill',
              description: 'Retrieve full skill prompt instructions with argument placeholders ($1, $ARGUMENTS, {{target}}) substituted with values',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Exact name of the skill' },
                  arguments: { type: 'object', description: 'Key-value map or positional string of arguments to substitute into the skill template' }
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
          const limit = args && args.limit ? args.limit : 20;
          const offset = args && args.offset ? args.offset : 0;
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(store.list(harness, limit, offset), null, 2) }]
          });
          return;
        }

        if (name === 'search_skills') {
          const query = args ? args.query : '';
          const harness = args ? args.harness : null;
          const limit = args && args.limit ? args.limit : 5;
          sendResponse(id, {
            content: [{ type: 'text', text: JSON.stringify(store.search(query, harness, limit), null, 2) }]
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

        if (name === 'render_skill') {
          const skillName = args ? args.name : '';
          const skillArgs = args ? (args.arguments || {}) : {};
          const rendered = store.render(skillName, skillArgs);
          if (!rendered) {
            sendResponse(id, {
              content: [{ type: 'text', text: `Skill "${skillName}" not found.` }],
              isError: true
            });
          } else {
            sendResponse(id, {
              content: [{
                type: 'text',
                text: `### Rendered Skill: ${skillName}\n\n---\n\n${rendered}`
              }]
            });
          }
          return;
        }

        if (name === 'sync_skills') {
          store.scan();
          sendResponse(id, {
            content: [{ type: 'text', text: `Successfully re-indexed skills across all harnesses. Total available: ${store.list(null, 1000).length}` }]
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
