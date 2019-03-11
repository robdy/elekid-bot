const request = require('request-promise');
const { parseString } = require('xml2js');
const logger = require('./logger.js');

// https://stackoverflow.com/a/35756636/9902555
function convertFromXml(xml) {
  return new Promise(((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rss.channel[0]);
      }
    });
  }));
}

async function pull(url) {
  const options = {
    method: 'GET',
    json: true,
    uri: url,
  };

  try {
    const response = await request(options);
    const parsed = convertFromXml(response);
    return Promise.resolve(parsed);
  } catch (error) {
    return Promise.reject(error);
  }
}

function getNewPosts(feed, rssSiteLastPost, siteUrl, isDev) {
  // Dates to be compared
  const rssSiteLastPostDate = new Date(rssSiteLastPost[siteUrl]);
  // Update last checked date
  const sortedFeed = feed.item.sort((a, b) => new Date(b.pubDate[0]) - new Date(a.pubDate[0]));
  if (new Date(rssSiteLastPost[siteUrl]) < new Date(sortedFeed[0].pubDate[0])) {
    /* eslint-disable no-param-reassign */
    rssSiteLastPost[siteUrl] = new Date(sortedFeed[0].pubDate[0]);
  }
  const lastPost = (({ pubDate, title }) => ({ pubDate, title }))(sortedFeed[0]);
  if (isDev) {
    logger.log(`${lastPost.title} at ${lastPost.pubDate}`);
    logger.log(`rssSiteLastPostDate: ${rssSiteLastPostDate}`);
  }
  // Find newly added posts
  return feed.item.filter(el => new Date(el.pubDate[0]) > new Date(rssSiteLastPostDate));
}

module.exports = {
  async grabRSS(siteUrl, rssLastPost, isDev) {
    const feed = await pull(siteUrl);
    const newPosts = await getNewPosts(feed, rssLastPost, siteUrl, isDev);
    return newPosts;
  },
};
