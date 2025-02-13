function generateUniqueKey() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Character set
  let id = '';
  for (let i = 0; i < 16; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length); // Get a random index
    id += charset[randomIndex]; // Append the character
  }
  return id;
}

let result = generateUniqueKey()

// Create a Set to store unique IDs
const generatedIDs = new Set();

function generateUniqueKeysInASet() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Character set
  let id;

  // Generate a new ID until it is unique
  do {
    id = '';
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length); // Get a random index
      id += charset[randomIndex]; // Append the character
    }
  } while (generatedIDs.has(id)); // Check for duplicates

  // Add the unique ID to the Set
  generatedIDs.add(id);

  return id;
}

module.exports = generateUniqueKeysInASet;