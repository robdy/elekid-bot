const Discord = require('discord.js');
const client  = new Discord.Client();
const config  = require('./config.js');

client.on('ready', () => {
  client.user.setPresence({ status: 'online', game: { name: '@Elekid bot on Azure'} });
  console.log("I'm in");
  console.log(client.user.username);
});
  
client.on('message', msg => {
  if (/[oO0]\/(?!\\[oO0])/.exec(msg.content)) {
    let sender = msg.author;
    const collector = new Discord.MessageCollector(msg.channel, m => m.author.id !== sender.id, { time: 10000 });
    collector.on('collect', msg => {
      let receiver = msg.author;
      if (/(?<![oO0]\/)\\[oO0]/.exec(msg.content)) {
        pingMsg = `${sender} o/\\o ${receiver}`;
        msg.channel.send(pingMsg);
      }
    })
  }
});

client.login(config.token);