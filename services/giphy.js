const giphyRequire = require('giphy-api');
const config = require('../config.js');
const logger = require('./logger.js');

// Connecting to GIPHY
const giphy = giphyRequire(config.giphy.key);

const giphyCache = [];

const findAllGiphUrls = async keyword => {
  if (giphyCache[keyword]) {
    return giphyCache[keyword];
  }
  const allGiphs = await giphy.search(keyword);
  const allUrls = allGiphs.data.map(a => a.images.original.url);
  giphyCache[keyword] = allUrls;
  return allUrls;
};

module.exports = {
  async searchGiphy(keyword) {
    try {
      const allUrls = await findAllGiphUrls(keyword);
      return allUrls[Math.floor(Math.random() * 25)];
    } catch (e) {
      logger.error(`Error while searching for GIF. ${e}`);
    }
    // Should never get here
    return false;
  },
};
