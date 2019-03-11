// Modules
const moment = require('moment');
// Discord
const Discord = require('discord.js');
// Twitter
const Twitter = require('twit');
// Config file
const config = require('./config.js');
const rss = require('./services/rss.js');
const logger = require('./services/logger.js');

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

// Create a stream to follow tweets
const stream = twitterClient.stream('statuses/filter', {
  follow: config.twitterUsersToFollow,
});

// https://github.com/ttezel/twit/issues/286#issuecomment-236315960
function isReply(tweet) {
  if (tweet.retweeted_status
    || tweet.in_reply_to_status_id
    || tweet.in_reply_to_status_id_str
    || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str
    || tweet.in_reply_to_screen_name) return true;
  return false;
}

function isOwnRetweet(tweet) {
  if (tweet.retweeted_status
      && config.twitterUsersToFollow.includes(tweet.user.id_str)) return true;
  return false;
}

stream.on('tweet', (tweet) => {
  // Exclude replies and retweet but not own ones
  if (isReply(tweet) && !(isOwnRetweet(tweet))) return true;

  // On dev, log tweets to console
  if (isDev) logger.log(tweet);

  const twitterMessage = `${tweet.user.name} (@${tweet.user.screen_name}) ${isOwnRetweet(tweet) ? 're' : ''}tweeted this at ${moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').format('YYYY-MM-DD HH:mm')}: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  for (let i = 0; i < config.updateChannels.length; i += 1) {
    client.channels.get(config.updateChannels[i]).send(twitterMessage);
  }

  return false;
});

client.on('ready', () => {
  // Presence settings
  const game = `@Elekid bot${isDev ? ' - dev' : ''}`;
  client.user.setPresence({
    status: 'online',
    game: {
      name: game,
    },
  });
  logger.log('I\'m in');
  logger.log(client.user.username);

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
      time: 120000,
      errors: ['time'],
    })
      .then((msgs) => {
        const reply = msgs.first();
        const receiver = msg.author;
        const pingMsg = `${sender} o/\\o ${receiver}`;
        reply.channel.send(pingMsg);
      })
      .catch(err => logger.log(`High five from ${sender.username} timeout. ${err}`));
  }

  // Low five
  if (/[oO0]\\(?!\/[oO0])/.exec(msg.content)) {
    const sender = msg.author;
    const filter = m => (/(?<![oO0]\\)\/[oO0]/.exec(m.content) && (isDev ? true : m.author.id !== sender.id) && !(m.author.bot));
    await msg.channel.awaitMessages(filter, {
      max: 1,
      time: 120000,
      errors: ['time'],
    })
      .then((msgs) => {
        const reply = msgs.first();
        const receiver = msg.author;
        const pingMsg = `${sender} o\\\\/o ${receiver}`;
        reply.channel.send(pingMsg);
      })
      .catch(err => logger.log(`Low five from ${sender.username} timeout. ${err}`));
  }

  // Respond to mention
  const didYouMentionMe = (message) => {
    message.mentions.users.some(mention => mention.id === client.user.id);
  };
  if (didYouMentionMe(msg)) {
    // embed generator: https://leovoel.github.io/embed-visualizer/
    const embed = {
      description: `You can find [my source code on GitHub](${config.githubUrl}).`,
      url: config.githubUrl,
      color: config.colors[0],
      timestamp: new Date(),
      footer: {
        icon_url: 'https://cdn.discordapp.com/avatars/366967440611082251/d65bf3e58a21bd1122c54e7e7ef931ca.png?size=40',
        text: 'made with ♥ by robdy',
      },
      thumbnail: {
        url: 'https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=160',
      },
      author: {
        name: 'Hello, I am Elekid bot',
        icon_url: 'https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=40',
      },
      fields: [{
        name: 'High five o/\\o',
        value: 'Send with `o/`and respond with `\\o`',
      },
      {
        name: 'Low five o\\\\/o',
        value: 'Send with `o\\`and respond with `/o`',
      },
      {
        name: 'Others',
        value: 'News - are being sent to predefined channels\nHelp - Ping me to see this message',
      },
      ],
    };
    msg.channel.send({
      embed,
    });
  }
});

client.login(config.token);
