/**
 * Frontmatter, Markdown & Template Rendering Parser for Smart Skills MCP
 */

function parseFrontmatter(content) {
  const result = { metadata: {}, body: content };
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (frontmatterMatch) {
    const yamlBlock = frontmatterMatch[1];
    result.body = frontmatterMatch[2].trim();

    yamlBlock.split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        let value = line.slice(colonIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        result.metadata[key] = value;
      }
    });
  }

  if (!result.metadata.name) {
    const headingMatch = result.body.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      result.metadata.name = headingMatch[1].trim();
    }
  }

  return result;
}

function renderSkill(body, args = {}) {
  if (!body) return '';
  let rendered = body;

  const fullArgs = typeof args === 'string' ? args : (args.$ARGUMENTS || args.arguments || args.args || '');
  const positionalList = typeof fullArgs === 'string' ? fullArgs.split(/\s+/).filter(Boolean) : [];

  // Replace $ARGUMENTS and $@
  rendered = rendered.replace(/\$ARGUMENTS|\$@/g, fullArgs);

  // Replace $1, $2, $3...
  positionalList.forEach((argVal, idx) => {
    const placeholder = new RegExp(`\\$${idx + 1}\\b`, 'g');
    rendered = rendered.replace(placeholder, argVal);
  });

  // Replace {{variable}} or $VARIABLE
  if (typeof args === 'object' && args !== null) {
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string' || typeof value === 'number') {
        const mustacheRegex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
        const dollarRegex = new RegExp(`\\$${key}\\b`, 'gi');
        rendered = rendered.replace(mustacheRegex, String(value));
        rendered = rendered.replace(dollarRegex, String(value));
      }
    }
  }

  return rendered;
}

module.exports = { parseFrontmatter, renderSkill };
