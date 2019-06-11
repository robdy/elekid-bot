const config = require('../config.js');

module.exports = {
  messageCondition(message, client) {
    return message.mentions.users.some(mention => mention.id === client.user.id);
  },
  richResponse() {
    // embed generator: https://leovoel.github.io/embed-visualizer/
    return {
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
  },
};
