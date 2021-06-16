const dotenv =  require('dotenv');

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  /**
   * port to start the server on
   */
  port: parseInt(process.env.PORT, 10),

  /**
   * mongodb database url
   */
  databaseURL: process.env.MONGODB_URI,

  /**
   * Your secret to use in signing the algorithm for generating the JWT
   */
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: ['sha1', 'RS256', 'HS256'],

  /**
   * default winston logger level
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  /**
   * API configs
   */
  api: {
    prefix: '/api',
  },
  /**
   * Gmail credentials for using google SMTP with nodemailer
   */
  mailer: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  },
};
