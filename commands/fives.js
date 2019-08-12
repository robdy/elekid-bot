const config = require('../config.js');
const giphyFunctions = require('../services/giphy.js');
const logger = require('../services/logger.js');

let pendingFives = [];
const isDev = (config.isDev === 'Y');


const fives = {
  'high-five': {
    left: /(\s|^)[oO0]\/(?!\\[oO0])(\s|$)/,
    right: /(\s|^)(?<![oO0]\/)\\[oO0](\s|$)/,
    title: 'High five ✋',
    marking: 'o/\\o',
  },
  'low-five': {
    left: /(\s|^)[oO0]\\(?!\/[oO0])(\s|$)/,
    right: /(\s|^)(?<![oO0]\\)\/[oO0](\s|$)/,
    title: 'Low five ✋',
    marking: 'o\\\\/o',
  },
  hug: {
    left: /(\s|^)[oO0][{[(](?![)\]}][oO0])(\s|$)/,
    right: /(\s|^)(?<![oO0][{[(])[)\]}][oO0](\s|$)/,
    title: 'Hug 🤗',
    marking: 'o{}o',
  },
};

const isFive = (message) => {
  const txt = message.content;
  const channel = message.channel.id;
  const author = message.author.id;
  const { createdAt } = message;
  for (let i = 0; i < (Object.keys(fives).length); i += 1) {
    const o = Object.keys(fives)[i];
    if (fives[o].right.exec(txt)) {
      return {
        name: o,
        side: 'right',
        channel,
        author,
        createdAt,
      };
    } if (fives[o].left.exec(txt)) {
      return {
        name: o,
        side: 'left',
        channel,
        author,
        createdAt,
      };
    }
  }
  return false;
};


module.exports = {
  messageCondition(message) {
    return isFive(message);
  },
  callback: async (message, client) => {
    const whichFive = isFive(message);
    logger.log(`${message.content} matched as ${whichFive.name}:${whichFive.side}`);
    const matchingFives = pendingFives.filter(el => el.channel === whichFive.channel
         && el.name === whichFive.name
         && el.side !== whichFive.side
         && (isDev || (el.author !== whichFive.author)));
    if (Array.isArray(matchingFives) && matchingFives.length) {
      // If matching pending five(s) were found
      for (let i = 0; i < matchingFives.length; i += 1) {
        /* eslint-disable no-await-in-loop */
        const pingMsg = {
          title: fives[whichFive.name].title,
          description: `${await client.fetchUser(matchingFives[i].author)} ${fives[whichFive.name].marking} ${await client.fetchUser(whichFive.author)}`,
          color: config.colors[0],
          image: {
            url: await giphyFunctions.searchGiphy(whichFive.name),
          },
          footer: {
            icon_url: 'https://i.imgur.com/rWk9hxP.png',
            text: 'Powered by GIPHY',
          },
        };
        /* eslint-disable no-await-in-loop */
        await message.channel.send({ embed: pingMsg });
        pendingFives = pendingFives.filter(el => !(el.channel === matchingFives[i].channel
            && el.name === matchingFives[i].name
            && el.side === matchingFives[i].side
            && el.author === matchingFives[i].author
            && el.createdAt === matchingFives[i].createdAt));
        logger.log(`Current stack for #${message.channel.name}:`);
        logger.log(pendingFives.filter(el => el.channel === whichFive.channel));
      }
    } else {
      // If no matching five is pending
      pendingFives.push(whichFive);
    }
    return true;
  },
};
