// Modules

// Discord
const Discord = require('discord.js');
// Twitter
const Twitter = require('twit');

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

// Create a stream to follow tweets
const stream = twitterClient.stream('statuses/filter', {
  follow: config.twitterUsersToFollow,
});

stream.on('tweet', tweet => {
  // Exclude replies and retweet but not own ones
  if (twitterFunctions.shouldBeExcluded(tweet)) return true;

  // On dev, log tweets to console
  if (isDev) logger.log(tweet);

  const twitterMessage = twitterFunctions.formatTweet(tweet);
  const channelsToPost = twitterFunctions.findProperDestinationChannel(tweet);

  for (let i = 0; i < channelsToPost.length; i += 1) {
    client.channels.get(channelsToPost[i]).send(twitterMessage);
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

client.on('message', async msg => {
  // Ignore bots
  if (msg.author.bot) return;

  // Special command for Ragnarok Battle Royale
  // Channel 598210289778819095 for prod and 547777562768572419 for testing
  if ((msg.channel.id === '598210289778819095' || msg.channel.id === '547777562768572419') && RegExp(`<@${client.user.id}> *(vote) [23]`).test(msg.content)) {
    try {
      const lastTwoMsgs = await client.channels.get(msg.channel.id).fetchMessages({ limit: 2 });
      const voteMsg = lastTwoMsgs.last();
      await voteMsg.react('🇦');
      await voteMsg.react('🇧');
      if (msg.content.split(' ')[msg.content.split(' ').length - 1] === '3') {
        await voteMsg.react('🇨');
      }
      msg.delete();
    } catch (e) {
      logger.error(e);
    }
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
      } else if (typeof commands[i].callback === 'function') {
        commands[i].callback(msg, client);
      }
      break;
    }
  }
});

// Handle disconnections
client.on('resume', () => {
  discordFunctions.init(client, 'resume');
});

// Error handling
client.on('error', err => {
  logger.error(err.message);
});

client.login(config.token);
