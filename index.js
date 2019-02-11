const Discord = require('discord.js');
const client  = new Discord.Client();
const config  = require('./config.js');

client.on('ready', () => {
  const game = '@Elekid bot' + (config.isDev ? ' - dev v' +  : '');
  client.user.setPresence({ status: 'online', game: { name: game} });
  console.log('I\'m in');
  console.log(client.user.username);
});
  
client.on('message', async msg => {
  // Ignore bots
  if(msg.author.bot) return;
  
  // High five
  if (/[oO0]\/(?!\\[oO0])/.exec(msg.content)) {
    const sender = msg.author;
    const filter = m => (/(?<![oO0]\/)\\[oO0]/.exec(m.content) && (config.isDev ? true : m.author.id !== sender.id) && !(m.author.bot));
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
      "description": "You can find [my source code on GitHub](" + config.githubUrl + ").",
      "url": config.githubUrl,
      "color": config.colors[0],
      "timestamp": new Date(),
      "footer": {
        "icon_url": "https://cdn.discordapp.com/avatars/366967440611082251/d65bf3e58a21bd1122c54e7e7ef931ca.png?size=40",
        "text": "made with ♥ by robdy"
      },
      "thumbnail": {
        "url": "https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=160"
      },
      "author": {
        "name": "Hello, I am Elekid bot",
        "icon_url": "https://cdn.discordapp.com/avatars/512740516371234826/789d4750ee72c08f06f38065b8923eec.png?size=40"
      },
      "fields": [
        {
          "name": "High five o/\\o",
          "value": "- Send someone high five: `o/`\n- Respond with `\\o`"
        },
        {
          "name": "Help",
          "value": "- Ping me to see this message"
        }
      ]
    };
    msg.channel.send({ embed });
  } 
});

client.login(config.token);