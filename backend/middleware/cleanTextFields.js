function cleanString(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\s+/g, ' ').trim();
}

function cleanArrayText(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map(item => (typeof item === 'string' ? cleanString(item) : item));
}

function cleanResponseObject(obj) {
  const cleaned = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      cleaned[key] = cleanString(value);
    } else if (Array.isArray(value)) {
      cleaned[key] = value.map(item =>
        typeof item === 'string' ? cleanString(item) : item
      );
    } else {
      cleaned[key] = value; // Leave untouched (can be extended to support nested)
    }
  }

  return cleaned;
}

module.exports = {
  cleanString,
  cleanArrayText,
  cleanResponseObject
};
