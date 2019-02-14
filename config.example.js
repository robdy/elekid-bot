require('dotenv').config();

module.exports = {
  // Tokens and keys
  token: process.env.DISCORD_TOKEN,
  twitter: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  // Environment
  isDev: process.env.IS_DEV,

  twitterUsersToFollow: [ // http://gettwitterid.com/
    '38857814', // @SerebiiNet
    '209088518', // @pokejungle
    '2839430431', // @PokemonGoApp
  ],

  // Channels
  updateChannels: [
    '11111111111111111111', // Channel where all updates should go
    '22222222222222222222', // Another channel where all updates should go
  ],

  // Look and feel
  colors: ['16770648', '7105386'], //  Sugimori artwork of shiny Elekid ['#FFE658', '#6C6B6A']
  githubUrl: 'https://github.com/robdy/elekid-bot',
};
