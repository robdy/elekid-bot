const mongoose = require('mongoose');
const config = require('../config.js');


module.exports = {
  message_condition(message, client) {
    return /redirect/.exec(message.content);
  },
  async textResponse(msg, client, db) {
    let reply;
    if (msg.mentions.channels.array().length === 0) {
      reply = 'No channel specified';
    } else if (msg.mentions.channels.array().length > 1) {
      reply = 'Too many channels specified';
    } else if (msg.mentions.channels.array().length === 1) {
      let configEntry;
      const channelID = msg.mentions.channels.first().id;

      const Destination = db.model('Destination');
      const doc = await Destination.findOne({
        guild: msg.guild.id,
      });
      if (doc === null) {
        configEntry = await Destination.create({
          guild: msg.guild.id,
          channel: channelID,
        });
        reply = `Channel <#${channelID}> selected`;
      } else {
        console.log('found');
        return `Channel <#${channelID}> already selected`;
      }
    } else {
      reply = 'Something went wrong';
    }
    return reply;
  },
};
