const dotenv = require('dotenv');
dotenv.config();
const envConfig = {
  jwtSecret: process.env.JWT_SECRET || 'defaultSecretKey',
}

module.exports = envConfig;