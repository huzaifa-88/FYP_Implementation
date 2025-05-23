// middleware/parser.js


function parseSteps(text) {
  if (!text || typeof text !== 'string') return [];

  // Normalize whitespace (including line breaks, tabs)
  text = text.replace(/\s+/g, ' ').trim();

  // Split using more reliable step indicators like:
  // - period followed by space + uppercase (new sentence)
  // - common connectors like 'and', 'then', 'after that'
  const rawSteps = text
    .split(/(?<=\.)\s+(?=[A-Z])|(?:\band\b|\bthen\b|\bafter that\b)/gi)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Number the steps cleanly
  return rawSteps.map((step, index) => `${index + 1}. ${step}`);
}

module.exports = {
  parseSteps,
};



// function parseSteps(text) {
//   if (!text || typeof text !== 'string') return [];

//   // Normalize spacing
//   text = text.replace(/\s+/g, ' ').trim();

//   // Split by connectors
//   const rawSteps = text
//     .split(/(?:\.|\band\b|\bthen\b|\bafter that\b|,)/i)
//     .map(s => s.trim())
//     .filter(s => s.length > 0);

//   // Number the steps
//   return rawSteps.map((step, index) => `${index + 1}. ${step}`);
// }

// module.exports = {
//   parseSteps,
// };
