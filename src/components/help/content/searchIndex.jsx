// A simple, dependency-free, client-side search indexer.
// In a real-world scenario, a library like FlexSearch or Lunr.js would be more robust.

let articles = [];
let index = new Map();

// Simple tokenizer
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

// Build the search index from the articles
export function buildIndex(articleData) {
  articles = articleData;
  index.clear();

  articles.forEach(article => {
    const docId = article.id;
    const doc = {
      title: tokenize(article.title),
      tags: tokenize(article.tags.join(' ')),
      summary: tokenize(article.summary),
    };

    const termFrequencies = new Map();

    // Process title (boosted)
    doc.title.forEach(term => {
      termFrequencies.set(term, (termFrequencies.get(term) || 0) + 5); // Boost title
    });
    // Process tags (boosted)
    doc.tags.forEach(term => {
      termFrequencies.set(term, (termFrequencies.get(term) || 0) + 3); // Boost tags
    });
    // Process summary
    doc.summary.forEach(term => {
      termFrequencies.set(term, (termFrequencies.get(term) || 0) + 1);
    });

    termFrequencies.forEach((freq, term) => {
      if (!index.has(term)) {
        index.set(term, []);
      }
      index.get(term).push({ docId, freq });
    });
  });
}

// Perform a search
export function search(query) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scores = new Map();

  queryTokens.forEach(token => {
    if (index.has(token)) {
      index.get(token).forEach(({ docId, freq }) => {
        scores.set(docId, (scores.get(docId) || 0) + freq);
      });
    }
  });

  const sortedDocs = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([docId, score]) => {
      const article = articles.find(a => a.id === docId);
      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        slug: article.slug,
        score,
      };
    });

  return sortedDocs;
}