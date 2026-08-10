/**
 * Frontmatter and Markdown Parser for Smart Skills MCP
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

module.exports = { parseFrontmatter };
