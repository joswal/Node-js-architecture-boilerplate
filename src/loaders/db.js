const mongoose = require('mongoose');
const config = require('../config');

/**
 * Opens a mongodb connection and returns The Db instance set when the connection is opened
 * @returns mongodb.Db
 */
const dbLoader = async () => {
  const connection = await mongoose.connect(config.databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

  return connection.connection.db;
}


module.exports = { dbLoader }