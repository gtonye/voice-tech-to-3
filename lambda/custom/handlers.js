const _ = require('lodash');
const fetch = require('node-fetch');
const NewsAPI = require('newsapi');
const config = require('./config');
const logger = require('./logger');

const newsapi = new NewsAPI(config.NEWS_API_KEY);
const CATEGORIES = [
  'business', 'technology',
  'entertainment', 'general',
  'health', 'science', 'sports'
];

const SMMRY_API_BASE_URL = `http://api.smmry.com?SM_API_KEY=${config.SMMRY_API_KEY}`;

const replaceAll = (target, search, replacement) => target.replace(new RegExp(search, 'g'), replacement);

const replaceSmmryBreakInText = text => replaceAll(text, '\\[BREAK\\]', '<break time="1.2s"/>');


const getTopHeadLine = category => newsapi.v2.topHeadlines({
  'category': category,
  'language': 'en',
  'country': 'us',
  'pageSize': 1
})
  .then((newsapiRes) => {
    logger.log('news api response:', JSON.stringify(newsapiRes));
    const article = _.get(newsapiRes, 'articles.0');

    if (_.isNil(article)) {
      return Promise.reject(Error('No article found'));
    }

    return Promise.resolve(article);
  });

const getArticleSummary = (article) => {
  const url = `${SMMRY_API_BASE_URL}&SM_WITH_BREAK&SM_LENGTH=${config.SMMRY_LENGTH}&SM_URL=${article.url}`;
  logger.log('smmry url:', url);

  return fetch(url)
    .then(fetchRes => fetchRes.json())
    .then((fetchResJson) => {
      const smmryTxt = _.get(fetchResJson, 'sm_api_content');

      if (_.isNil(smmryTxt)) {
        return Promise.reject(Error('No smmry text in response'));
      }
      return Promise.resolve(replaceSmmryBreakInText(smmryTxt));
    });
};

function launchRequestHandler() {
  this.response.speak('Hi, which topic are you interested in today?')
    .listen('which topic are you interested in today?');
  return this.emit(':responseReady');
}

function newsInquiryIntentHandler() {
  const topic = _.get(this.event, 'request.intent.slots.topic.resolutions.resolutionsPerAuthority.0.values.0.value.name');
  const functionContext = this;

  if (_.isNil(topic)) {
    const topicInquiry = 'which topic are you interested in today?';
    this.response.speak(topicInquiry).listen(topicInquiry);
    return this.emit(':responseReady');
  } else if (!CATEGORIES.includes(topic)) {
    this.response
      .speak(`I can only help you with ${CATEGORIES.join(', ')}. in which one would you be interested today?`)
      .listen(`which topic between ${CATEGORIES.join(', ')} would interest you today?`);
    return this.emit(':responseReady');
  }

  let topArticle;
  return getTopHeadLine(topic)
    .then((topHeadlineArticle) => {
      topArticle = topHeadlineArticle;
      return getArticleSummary(topArticle)
        .then((topArticleSummary) => {
          functionContext.response.speak(`the top headline is ${topArticle.title}<break time="1s"/> Here is the summary:<break time="1s"/>${topArticleSummary}`);
          return functionContext.emit(':responseReady');
        });
    })
    .catch((err) => {
      logger.log('Error while looking for the summary of the article: ', err);
      return this.emit(':tell', 'Sorry something is wrong on my side, please try again in a moment.');
    });
}

module.exports = {
  'LaunchRequest': launchRequestHandler,
  'NewsInquiryIntent': newsInquiryIntentHandler
};
