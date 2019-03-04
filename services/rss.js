const request = require('request-promise');
const parseString = require('xml2js').parseString;

// https://stackoverflow.com/a/35756636/9902555
function convertFromXml (xml) {
  return new Promise(function(resolve, reject)
    {
      parseString(xml, function(err, result){
        if(err){
          reject(err);
         }
         else {
           resolve(result.rss.channel[0]);
         }
    });
});  
}

async function pull(url) { 
  const options = {
    method: `GET`,
    json: true,
    uri: url,
  };

  try {
    const response = await request(options);
    const parsed = convertFromXml(response);
    return Promise.resolve(parsed);
  }
  catch (error) {
    return Promise.reject(error);
  }
}

function getNewPosts (feed, lastChecked) {
    const lastCheckedDate = new Date(lastChecked);
    const lastBuildDate = new Date(feed.lastBuildDate);
    if (lastCheckedDate < lastBuildDate) {
      return feed.item[0];    
    }
    else return;
  }

module.exports = {
  async grabRSS (siteUrl) {
    pull(siteUrl)
    .then(res => console.log(getNewPosts(res, 'Fri, 01 Mar 2019 17:43:18 +0000')))
    .catch(err => console.log(err));
}
}