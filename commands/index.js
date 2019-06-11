// Export the names of all files in the current directory.
// This allows new files to be added without having to explicitly list them in main file

require('fs').readdirSync(`${__dirname}/`).forEach((file) => {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    const name = file.replace('.js', '');
    /* eslint-disable import/no-dynamic-require */
    const { messageCondition, richResponse, textResponse } = require(`./${file}`);
    if (!messageCondition) {
      return;
    }
    module.exports[name] = {
      messageCondition,
      richResponse,
      textResponse,
    };
  }
});
