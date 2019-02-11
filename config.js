require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  isDev: process.env.IS_DEV,
  colors: ['16770648', '7105386'], //  Sugimori artwork of shiny Elekid ['#FFE658', '#6C6B6A']
  githubUrl: 'https://github.com/robdy/elekid-bot'
};