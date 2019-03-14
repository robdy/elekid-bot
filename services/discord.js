const logger = require('./logger.js');
const config = require('../config.js');
const isDev = (config.isDev === 'Y');

module.exports = {
  init (client, event) {
    const game = `@Elekid bot${isDev ? ' - dev' : ''}`;
    client.user.setPresence({
      status: 'online',
      game: {
        name: game,
      },
    });
    logger.log(`I\'m in${event === 'resume' ? ' after disconnection.' : '.'}`);
    logger.log(client.user.username);
  }
}