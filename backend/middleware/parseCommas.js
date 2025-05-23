// function parseCommas(text) {
//   if (!text || typeof text !== 'string') return [];

//   // Split the text by both semicolon and comma using regex, trim, and filter empty strings
//   const parsedArray = text
//     .split(/[,]+/)
//     .map(e => e.trim())
//     .filter(e => e.length > 0);

//   return parsedArray;
// }

// module.exports = { parseCommas };
function parseCommas(text) {
  if (!text || typeof text !== 'string') return [];

  // Split by comma, semicolon, or the word "and" (with optional surrounding spaces)
  const parsedArray = text
    .split(/\s*(?:,|\band\b)\s*/i)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  return parsedArray;
}

module.exports = { parseCommas };
