const fs = require('fs');
const path = require('path');
const db = require('./database');
const config = require('./index');
const User = require('../models/User');

const schemaPath = path.join(__dirname, 'schema.sql');

async function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schema);

  if (config.adminEmail && config.adminPassword) {
    await User.ensureAdmin({
      name: config.adminName,
      email: config.adminEmail,
      password: config.adminPassword
    });
  }
}

module.exports = { initDatabase };
