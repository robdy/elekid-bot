const moment = require('moment');
const config = require('../config.js');
const serversConfig = require('../servers.js');

// https://github.com/ttezel/twit/issues/286#issuecomment-236315960
function isReply(tweet) {
  if (tweet.retweeted_status
    || tweet.in_reply_to_status_id
    || tweet.in_reply_to_status_id_str
    || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str
    || tweet.in_reply_to_screen_name) return true;
  return false;
}

function isOwnRetweet(tweet) {
  if (tweet.retweeted_status
      && config.twitterUsersToFollow.includes(tweet.user.id_str)) return true;
  return false;
}

module.exports = {
  shouldBeExcluded: tweet => (isReply(tweet) && !(isOwnRetweet(tweet))),
  formatTweet: tweet => `${tweet.user.name} (@${tweet.user.screen_name}) ${isOwnRetweet(tweet) ? 're' : ''}tweeted this at ${moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').format('YYYY-MM-DD HH:mm')}: https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
  findProperDestinationChannel: tweet => Object.keys(serversConfig).reduce((filtered, obj) => {
    const twitterAuthorID = tweet.user.id_str;

    // case of posting by default
    if (serversConfig[obj].sources.postByDefault) {
      // check if there are any redirects
      // and if there's a redirect for specific author
      if (Object.prototype.hasOwnProperty.call(serversConfig[obj].sources, 'redirects')
          && Object.prototype.hasOwnProperty
            .call(serversConfig[obj].sources.redirects, twitterAuthorID)) {
        if (serversConfig[obj].sources.redirects[twitterAuthorID]) {
          // if redirect for specific author is NOT empty string
          // add it to an array
          filtered.push(serversConfig[obj].sources.redirects[twitterAuthorID]);
        } else {
          // is redirect for specific author is empty string
          // do not add any channel ID to the array
          return filtered;
        }
      } else {
        // no redirects at all, use default channel
        filtered.push(serversConfig[obj].sources.postByDefault);
      }
    } else if (Object.prototype.hasOwnProperty.call(serversConfig[obj].sources, 'redirects')
        && Object.prototype.hasOwnProperty
          .call(serversConfig[obj].sources.redirects, twitterAuthorID)
        && serversConfig[obj].sources.redirects[twitterAuthorID]) {
      // case of posting only allowed sources
      // if there are redirects defined
      // and redirect for specific author exists
      // and that redirect is not empty string
      // add the redirect
      filtered.push(serversConfig[obj].sources.redirects[twitterAuthorID]);
    }
    return filtered;
  }, []),
};
