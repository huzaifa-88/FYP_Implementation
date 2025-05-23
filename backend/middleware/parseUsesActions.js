// middleware/parseField.js

// function parseUsesActions(text, separator = ';') {
//   if (!text || typeof text !== 'string') return [];

//   // Split the text based on the separator (e.g., semicolon) and clean up extra spaces
//   const parsedArray = text.split(separator)
//     .map(e => e.trim())  // Trim each entry to remove extra spaces
//     .filter(e => e.length > 0);  // Remove empty entries

//   return parsedArray;
// }

// module.exports = { parseUsesActions };
function parseUsesActions(text) {
  if (!text || typeof text !== 'string') return [];

  // Split the text by both semicolon and comma using regex, trim, and filter empty strings
  const parsedArray = text
    .split(/[;]+/)
    .map(e => e.trim())
    .filter(e => e.length > 0);

  return parsedArray;
}

module.exports = { parseUsesActions };

