// Modules

// Discord
const Discord = require('discord.js');
// Twitter
const Twitter = require('twit');
// Giphy
const giphyRequire = require('giphy-api');

// const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');

// Config file
const config = require('./config.js');
const rss = require('./services/rss.js');
const logger = require('./services/logger.js');
const commands = require('./commands');
const discordFunctions = require('./services/discord.js');
const twitterFunctions = require('./services/twitter.js');

// Other
const isDev = (config.isDev === 'Y');

const client = new Discord.Client();
const twitterClient = new Twitter(config.twitter);

const rssLastPost = {};
const timeNow = new Date(Date.now());
for (let i = 0; i < config.rssToFollow.length; i += 1) {
  rssLastPost[config.rssToFollow[i]] = timeNow;
}

if (isDev) {
  config.twitterUsersToFollow.push('2899773086');
} // add @Every3Minutes to follow list for testing

// Connecting to GIPHY
const giphy = giphyRequire(config.giphy.key);

// Create a new MongoClient
/* WIP const mongoose = require('mongoose');

mongoose.connect(`${config.mongoDB.url}/${config.mongoDB.dbName}`, { useNewUrlParser: true });

// Use connect method to connect to the Server
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  logger.log('Successfully connected to database');
});

const destinationSchema = new mongoose.Schema({
  guild: String,
  channel: String,
});

const Destination = mongoose.model('Destination', destinationSchema);
*/
/*
const twitterIDs = twitterClient.post('users/lookup', {
  screen_name: config.twitterNamesToFollow.map((element) => element.replace('https://twitter.com/','')).join(),
})
.then((el) => el.data.map((element) => {
  id: element.id_str,
  name: element.screen_name,
}))
.then(console.log);
*/
// Create a stream to follow tweets
const stream = twitterClient.stream('statuses/filter', {
  follow: config.twitterUsersToFollow,
});

stream.on('tweet', (tweet) => {
  // Exclude replies and retweet but not own ones
  if (twitterFunctions.shouldBeExcluded(tweet)) return true;

  // On dev, log tweets to console
  if (isDev) logger.log(tweet);

  const twitterMessage = twitterFunctions.formatTweet(tweet);
  for (let i = 0; i < config.updateChannels.length; i += 1) {
    client.channels.get(config.updateChannels[i]).send(twitterMessage);
  }

  return false;
});

client.on('ready', () => {
  discordFunctions.init(client, 'ready');

  // Grab RSS posts
  const rssGrabAndPost = async () => {
    try {
      for (let r = 0; r < config.rssToFollow.length; r += 1) {
        /* eslint-disable no-await-in-loop */
        const posts = await rss.grabRSS(config.rssToFollow[r], rssLastPost, isDev);
        if (posts) {
          for (let j = posts.length - 1; j >= 0; j -= 1) { // post in chronological order
            for (let i = 0; i < config.updateChannels.length; i += 1) {
              const authorInfo = posts[j]['dc:creator'] ? ` by ${posts[j]['dc:creator']}` : '';
              const newsMessageTxt = `New post${authorInfo}: **${posts[j].title}**\n${posts[j].link[0].split('?')[0]}`;
              logger.log(`${newsMessageTxt} published ${posts[j].pubDate}`);
              client.channels.get(config.updateChannels[i]).send(newsMessageTxt);
            }
          }
        }
      }
    } catch (e) {
      logger.error(e);
    }
  };

  rssGrabAndPost();
  setInterval(rssGrabAndPost, 120 * 1000);
});

client.on('message', async (msg) => {
  // Ignore bots
  if (msg.author.bot) return;

  // High five
  if (/[oO0]\/(?!\\[oO0])/.exec(msg.content)) {
    const sender = msg.author;
    const filter = m => (/(?<![oO0]\/)\\[oO0]/.exec(m.content) && (isDev ? true : m.author.id !== sender.id) && !(m.author.bot));
    await msg.channel.awaitMessages(filter, {
      max: 1,
      time: 600000,
      errors: ['time'],
    })
      .then((msgs) => {
        giphy.search('high-five')
          .then((res) => {
            const reply = msgs.first();
            const receiver = reply.author;
            const pingMsg = {
              title: 'High five ✋',
              description: `${sender} o/\\o ${receiver}`,
              color: config.colors[0],
              image: {
                url: res.data[Math.floor(Math.random() * 25)].images.original.url,
              },
              footer: {
                icon_url: 'https://i.imgur.com/rWk9hxP.png',
                text: 'Powered by GIPHY',
              },
            };
            reply.channel.send({
              embed: pingMsg,
            });
          });
      })
      .catch(err => logger.log(`High five from ${sender.username} timeout. ${err}`));
  }

  // Low five
  if (/[oO0]\\(?!\/[oO0])/.exec(msg.content)) {
    const sender = msg.author;
    const filter = m => (/(?<![oO0]\\)\/[oO0]/.exec(m.content) && (isDev ? true : m.author.id !== sender.id) && !(m.author.bot));
    await msg.channel.awaitMessages(filter, {
      max: 1,
      time: 600000,
      errors: ['time'],
    })
      .then((msgs) => {
        giphy.search('low-five')
          .then((res) => {
            const reply = msgs.first();
            const receiver = reply.author;
            const pingMsg = {
              title: 'Low five ✋',
              description: `${sender} o\\\\/o ${receiver}`,
              color: config.colors[0],
              image: {
                url: res.data[Math.floor(Math.random() * 25)].images.original.url,
              },
              footer: {
                icon_url: 'https://i.imgur.com/rWk9hxP.png',
                text: 'Powered by GIPHY',
              },
            };
            reply.channel.send({
              embed: pingMsg,
            });
          });
      })
      .catch(err => logger.log(`Low five from ${sender.username} timeout. ${err}`));
  }

  /* eslint-disable no-restricted-syntax */
  for (const i in commands) {
    if (commands[i].messageCondition(msg, client)) {
      if (commands[i].richResponse) {
        msg.channel.send({
          embed: commands[i].richResponse(msg, client),
        });
      } else if (commands[i].textResponse) {
        msg.channel.send(await commands[i].textResponse(msg, client));
      }
    }
  }
});

// Handle disconnections
client.on('resume', () => {
  discordFunctions.init(client, 'resume');
});

// Error handling
client.on('error', (err) => {
  logger.error(err.message);
});

client.login(config.token);
