// Export the names of all files in the current directory. This allows new files to be added without having to explicitly list them in main file
require('fs').readdirSync(__dirname + '/').forEach(function (file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    const name = file.replace('.js', '');
    const { message_condition, response } = require('./' + file);
    if (!message_condition) {
        return;
    }
    module.exports[name] = { 
      message_condition,
      response
    }
  }
});