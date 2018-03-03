const Alexa = require('alexa-sdk');
const handlers = require('./handlers');

function indexHandler(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.registerHandlers(handlers);
  alexa.execute();
}

exports.handler = indexHandler;
