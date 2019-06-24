const giphyRequire = require('giphy-api');
const config = require('../config.js');
const logger = require('./logger.js');

// Connecting to GIPHY
const giphy = giphyRequire(config.giphy.key);

module.exports = {
  async searchGiphy(keyword) {
    try {
      const foundGiphy = await giphy.search(keyword);
      return foundGiphy.data[Math.floor(Math.random() * 25)].images.original.url;
    } catch (e) {
      logger.error(`Error while searching for GIF. ${e}`);
    }
    // Should never get here
    return false;
  },
};
