const config = require('../config.js');

module.exports = {
  message_condition(message, client) {
    return ((/^nick +[a-z0-9 ]+$/i.exec(message.content)) && (config.pokemontrades.nicknameChannel.includes(message.channel.id)));
  },
  async textResponse(msg, client) {
    const oldNick = msg.member.displayName;
    const desiredNick = msg.content.substring(4).trim();
    if (!desiredNick) {
      msg.delete();
      return `:warning: ${msg.author} You need to specify nickname!`;
    }
    const redditNick = msg.member.displayName.match(/(?:\w+ \()(\w+)(?:\))/) ? msg.member.displayName.match(/(?:\w+ \()(\w+)(?:\))/)[1] : msg.member.displayName;
    const newNickname = (desiredNick === 'reset') ? redditNick : `${desiredNick} (${redditNick})`;
    if (newNickname.length > 32) return ':no_entry: ERROR: **Nickname too long**';

    const hasPermissions = msg.guild.me.hasPermission('MANAGE_NICKNAMES');
    const hasMsgPermissions = msg.guild.me.permissionsIn(msg.channel).has('MANAGE_MESSAGES');

    if (!hasPermissions) {
      msg.delete();
      return ':warning: I don\'t have `MANAGE_NICKNAMES` right - please talk with server administrator!';
    }
    if (!hasMsgPermissions) {
      msg.channel.send(':warning: I don\'t have `MANAGE_MESSAGES` right - please talk with server administrator!');
    } else {
      msg.delete();
    }
    return result = await msg.member.setNickname(newNickname)
      .then(res => `Nickname of \`${msg.author.username}#${msg.author.discriminator}\` successfully changed from \`${oldNick}\` to \`${newNickname}\``)
      .catch((err) => {
        let additionalMessage = '';
        if (err.message === 'Missing Permissions') {
          additionalMessage = 'Are you an admin?';
        }
        return `:no_entry: ERROR: Discord responded with: **${err.message}**. ${additionalMessage}`;
      });
    return ':no_entry: Unknown error';
  },
};
