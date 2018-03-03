function log(...args) {
  if (!process.env.IS_TEST) {
    console.log(args); // eslint-disable-line no-console
  }
}

module.exports = {
  'log': log
};
