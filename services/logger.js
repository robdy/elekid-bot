// Inspired by https://stackoverflow.com/a/18410523/9902555

const timestampLog = function timestampLog() {};
timestampLog.toString = () => `[LOG ${(new Date()).toLocaleTimeString()}]`;

const timestampWrn = function timestampWrn() {};
timestampWrn.toString = () => `[WRN ${(new Date()).toLocaleTimeString()}]`;

const timestampErr = function timestampErr() {};
timestampErr.toString = () => `[ERR ${(new Date()).toLocaleTimeString()}]`;

module.exports = {
  /* eslint-disable no-console */
  log: console.log.bind(console, '%s', timestampLog),
  warn: console.warn.bind(console, '%s', timestampWrn),
  error: console.error.bind(console, '%s', timestampErr),
};
