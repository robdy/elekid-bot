require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  isDev: process.env.IS_DEV
};