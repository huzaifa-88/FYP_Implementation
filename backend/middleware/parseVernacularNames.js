const LANGUAGE_MAP = {
  A: 'Arabic',
  B: 'Bengali',
  E: 'English',
  G: 'Gujarati',
  H: 'Hindi',
  P: 'Persian',
  S: 'Sanskrit',
  T: 'Tamil',
};

function parseVernacularNames(text) {
  if (!text || typeof text !== 'string') return [];

  // Split entries by semicolon and clean up any empty entries
  const entries = text.split(';').map(e => e.trim()).filter(e => e.length > 0);

  const result = [];

  for (let entry of entries) {
    // Split the entry into parts based on spaces, targeting the language code
    const parts = entry.split(/\s(?=[A-Z];?)/).map(p => p.trim());

    // Ensure there are at least two parts (name and language code)
    if (parts.length >= 2) {
      // Join all parts except for the last one as the drug name
      const name = parts.slice(0, -1).join(' ').trim();

      // Match the language code (first character of the last part)
      const codeMatch = parts[parts.length - 1].match(/^([A-Z])/);

      if (codeMatch && LANGUAGE_MAP[codeMatch[1]]) {
        // Get the language and name, removing any "and" at the beginning or end of the name
        let cleanedName = name.replace(/^and\s+/i, '').replace(/\s+and$/i, '').trim();

        result.push({
          language: LANGUAGE_MAP[codeMatch[1]],
          name: cleanedName,
        });
      }
    }
  }

  return result;
}

module.exports = { parseVernacularNames };