/**
 * Advanced Search & Tokenized Relevance Engine for Smart Skills
 */

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\sа-яА-ЯёЁ]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function calculateScore(skill, query) {
  if (!query) return 1;
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 0;

  const nameLower = skill.name.toLowerCase();
  const descLower = (skill.description || '').toLowerCase();
  const bodyLower = (skill.body || '').toLowerCase();
  const tags = (skill.metadata.tags || skill.metadata.keywords || '').toLowerCase();

  let score = 0;

  // Exact skill name match
  if (nameLower === query.toLowerCase()) score += 100;
  else if (nameLower.includes(query.toLowerCase())) score += 40;

  for (const token of qTokens) {
    if (nameLower.includes(token)) score += 20;
    if (tags.includes(token)) score += 15;
    if (descLower.includes(token)) score += 10;
    
    // Count body term frequency (cap at 10 matches)
    const bodyMatches = (bodyLower.match(new RegExp(token, 'g')) || []).length;
    score += Math.min(bodyMatches, 10) * 2;
  }

  return score;
}

module.exports = { tokenize, calculateScore };
