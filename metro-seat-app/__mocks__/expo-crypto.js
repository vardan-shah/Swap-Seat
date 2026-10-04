const crypto = require('crypto');
module.exports = {
  randomUUID: () => crypto.randomUUID(),
  getRandomBytes: (size) => crypto.randomBytes(size),
};
