const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

module.exports = {
  mongodb: {
    connectionString: process.env.MONGODB_CONNECTION_STRING,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-cbc',
  },
};