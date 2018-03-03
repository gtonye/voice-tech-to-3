const Alexa = require('alexa-sdk');
const handlers = require('./handlers');

function indexHandler(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = 'amzn1.ask.skill.39dd13d1-8388-471c-8a3c-baabed440cc3';
  alexa.registerHandlers(handlers);
  alexa.execute();
}

exports.handler = indexHandler;
