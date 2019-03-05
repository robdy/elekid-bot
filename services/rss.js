const request = require('request-promise');
const { parseString } = require('xml2js');

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

function getNewPosts(feed, rssSiteLastChecked, siteUrl, isDev) {  
  // Dates to be compared
  const lastCheckedDate = rssSiteLastChecked[siteUrl] ? new Date(rssSiteLastChecked[siteUrl]) : null;
  const lastBuildDate = new Date(feed.lastBuildDate);
  // Update last checked date
  rssSiteLastChecked[siteUrl] = new Date(Date.now());
  // Find newly added posts
  if (lastCheckedDate < lastBuildDate || isDev) { // null < date evaluates to true
    return feed.item.filter(function (el) {
      return new Date(el.pubDate[0]) > new Date('Wed, 27 Feb 2019 13:59:29 +0000');
    });
  }
  else return null;
}

module.exports = {
  async grabRSS(siteUrl, rssLastChecked, isDev) {
    const feed = await pull(siteUrl);
    return getNewPosts(feed, rssLastChecked, siteUrl, isDev);
  },
};
