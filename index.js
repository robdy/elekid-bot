const Discord = require('discord.js');
const client  = new Discord.Client();
const config  = require('./config.js');
const twitter = require('twit');
 
const twitterClient = new twitter( config.twitter );

if ( config.isDev === "Y" ) { config.twitterUsersToFollow.push('2899773086') } // @Every3Minutes

const stream = twitterClient.stream('statuses/filter', { follow: config.twitterUsersToFollow });

// https://github.com/ttezel/twit/issues/286#issuecomment-236315960
function isReply(tweet) {
  if ( tweet.retweeted_status
    || tweet.in_reply_to_status_id
    || tweet.in_reply_to_status_id_str
    || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str
    || tweet.in_reply_to_screen_name )
    return true
}

function isOwnRetweet(tweet) {
  if ( tweet.retweeted_status && config.twitterUsersToFollow.includes( tweet.user.id_str ))
    return true;
}

stream.on('tweet', function (tweet) {
  // Exclude replies and retweet but not own ones
  if ( isReply(tweet) && !(isOwnRetweet(tweet)) ) return true;
  
  // On dev, log tweets to console
  if(config.isDev === 'Y') console.log(tweet);
  
  const twitterMessage = tweet.user.name + ' (@' + tweet.user.screen_name + ') ' + ( isOwnRetweet(tweet) ? 're' : '' ) + 'tweeted this at ' + tweet.created_at + ': https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
  for (let i = 0; i < config.updateChannels.length; i++) {
    client.channels.get( config.updateChannels[i] ).send( twitterMessage );
  }
})

client.on('ready', () => {
  // Presence settings
  const game = '@Elekid bot' + (config.isDev === 'Y' ? ' - dev' : '');
  client.user.setPresence({ status: 'online', game: { name: game} });
  console.log('I\'m in');
  console.log(client.user.username);
  
  // Tasks
   //setInterval(executeTask, 10 * 1000);
});
  
client.on('message', async msg => {
  // Ignore bots
  if(msg.author.bot) return;
  
  // High five
  if (/[oO0]\/(?!\\[oO0])/.exec(msg.content)) {
    const sender = msg.author;
    const filter = m => (/(?<![oO0]\/)\\[oO0]/.exec(m.content) && (config.isDev === 'Y' ? true : m.author.id !== sender.id) && !(m.author.bot));
    await msg.channel.awaitMessages(filter, { max:1, time: 120000, errors: ['time'] })
    .then( msgs => {
      const msg = msgs.first();
      const receiver = msg.author;
      pingMsg = `${sender} o/\\o ${receiver}`;
      msg.channel.send(pingMsg);
    })
    .catch(err => console.log('High five from ' + sender.username + ' timeout'));
  }

  // Respond to mention
  const didYouMentionMe = msg => msg.mentions.users.some( mention => mention.id === client.user.id);
  if (didYouMentionMe(msg)) {
    // embed generator: https://leovoel.github.io/embed-visualizer/
    const embed = {
      'description': 'You can find [my source code on GitHub](' + config.githubUrl + ').',
      'url': config.githubUrl,
      'color': config.colors[0],
      'timestamp': new Date(),
      'footer': {
        'icon_url': 'https://cdn.discordapp.com/avatars/366967440611082251/d65bf3e58a21bd1122c54e7e7ef931ca.png?size=40',
        'text': 'made with ♥ by robdy'
      },
      'thumbnail': {
        'url': 'https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=160'
      },
      'author': {
        'name': 'Hello, I am Elekid bot',
        'icon_url': 'https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=40'
      },
      'fields': [
        {
          'name': 'High five o/\\o',
          'value': '- Send someone high five: `o/`\n- Respond with `\\o`'
        },
        {
          'name': 'News',
          'value': '- Are being sent to predefined channels'
        },
        {
          'name': 'Help',
          'value': '- Ping me to see this message'
        }
      ]
    };
    msg.channel.send({ embed });
  } 
});

client.login(config.token);