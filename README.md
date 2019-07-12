[![Greenkeeper badge](https://badges.greenkeeper.io/robdy/elekid-bot.svg)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/robdy/elekid-bot/tree/master.svg?style=shield)](https://circleci.com/gh/robdy/elekid-bot/tree/master)

Add bot to your server using [this link](https://discordapp.com/oauth2/authorize?client_id=512740516371234826&scope=bot&permission=2048).

# Usage
Currently the following functions/commands are available:

`@Elekid#3797` or `@Elekid#3797 help` displays bot info.

## High/low five

Send `o/` and wait for someone else to respond with `\o`. The bot will respond with high five powered with random GIF (powered by [GIPHY](https://giphy.com)).

Similarly, `o\` and `/o` generates low five and `o{` and `}o` gives a hug.

*Sadly, no self-fives available*

## News


# Configuration

Create `.env` file with the following content

```
IS_DEV=Y
DISCORD_TOKEN=PUT.YOUR.DISCORD.TOKEN.HERE
TWITTER_CONSUMER_KEY=PUT.YOUR.TWITTER.CONSUMER.KEY.HERE
TWITTER_CONSUMER_SECRET=PUT.YOUR.TWITTER.CONSUMER.SECRET.HERE
TWITTER_ACCESS_TOKEN_KEY=YOUR.TWITTER.ACCESS.TOKEN.KEY.HERE
TWITTER_ACCESS_TOKEN_SECRET=YOUR.TWITTER.ACCESS.TOKEN.SECRET.HERE
```

Copy the following files:`config.example.js` to `config.js`, `servers.example.js` to `servers.js` and add the IDs of channels to which you want to send updates.

`servers.js` supports redirecting of Twitter sources for now.
