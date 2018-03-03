const sinon = require('sinon');
const sinonStubPromise = require('sinon-stub-promise');

const NEWS_API_SUCCESS_1_ARTICLE_RES = require('../data/news-api-success-response-1-article.json');
const NEWS_API_SUCCESS_0_ARTICLE_RES = require('../data/news-api-success-response-0-article.json');
const ALEXA_LAUNCH_REQUEST = require('../data/alexa-launch-request.json');
const ALEXA_NEWS_INQUIRY_REQUEST = require('../data/alexa-news-inquiry-intent.json');
const SMMRY_API_SUCCESS_RES = require('../data/smmry-api-success-response.json');

sinonStubPromise(sinon);
const mockedFetch = sinon.stub();
jest.mock('node-fetch', () => mockedFetch);

const mockTopHeadLines = jest.fn();
class mockNewsApi {
  constructor() {
    this.v2 = {
      'topHeadlines': mockTopHeadLines
    }
  }
}
jest.mock('newsapi', () => mockNewsApi);

// mock configuration
process.env = {
  'NEWS_API_KEY': 'nap-123',
  'SMMRY_API_KEY': 'sak-123',
  'SMMRY_LENGTH': '1',
  'IS_TEST': true
};


const handlers = require('../../handlers');

describe('Handlers testing', () => {
  let mockContext;
  const mockContextResponseListen = jest.fn();
  const mockContextResponseSpeak = jest.fn(() => {
    return { 'listen': mockContextResponseListen };
  });
  beforeEach(() => {
    jest.resetModules();
    mockContextResponseSpeak.mockClear();
    mockContextResponseListen.mockClear();
    mockContext = {
      'emit': jest.fn(),
      'response': {
        'speak': mockContextResponseSpeak
      }
    };
  });

  describe('Launch request', () => {
    it('should send back a speak, listen response', () => {
      mockContext.event = ALEXA_LAUNCH_REQUEST;
      handlers.LaunchRequest.call(mockContext);
      expect(mockContextResponseSpeak).toHaveBeenCalledWith('Hi, which topic are you interested in today?');
      expect(mockContextResponseListen).toHaveBeenCalledWith('which topic are you interested in today?');
      expect(mockContext.emit).toHaveBeenCalledWith(':responseReady');
    });
  });

  describe('News Inquiry Intent', () => {

    it('should return the summary of the top article for a category', () => {
      const newsApiUrl = 'http://api.smmry.com?SM_API_KEY=sak-123&SM_WITH_BREAK&SM_LENGTH=1&SM_URL=http://test.url';
      mockedFetch.withArgs(newsApiUrl)
        .returnsPromise()
        .resolves({ 'json': () => Promise.resolve(SMMRY_API_SUCCESS_RES) });

      mockTopHeadLines.mockImplementation(() => Promise.resolve(NEWS_API_SUCCESS_1_ARTICLE_RES));

      mockContext.event = ALEXA_NEWS_INQUIRY_REQUEST;

      return handlers.NewsInquiryIntent.call(mockContext)
        .then(() => {
          expect(mockTopHeadLines).toHaveBeenCalledWith({
            'category': 'technology',
            'language': 'en',
            'country': 'us',
            'pageSize': 1
          });
          expect(mockContextResponseSpeak).toHaveBeenCalledWith('the top headline is article title<break time="1s"/> Here is the summary:<break time="1s"/>article<break time="1.2s"/>summary');
          expect(mockContext.emit).toHaveBeenCalledWith(':responseReady');
        });
    });

    it('should say that an error occurred if no article was available on news api', () => {
      mockTopHeadLines.mockImplementation(() => Promise.resolve(NEWS_API_SUCCESS_0_ARTICLE_RES));

      mockContext.event = ALEXA_NEWS_INQUIRY_REQUEST;
      return handlers.NewsInquiryIntent.call(mockContext).then(() => {
        expect(mockTopHeadLines).toHaveBeenCalledWith({
          'category': 'technology',
          'language': 'en',
          'country': 'us',
          'pageSize': 1
        });
        expect(mockContextResponseSpeak).not.toHaveBeenCalled();
        expect(mockContext.emit).toHaveBeenCalledWith(':tell', 'Sorry something is wrong on my side, please try again in a moment.');
      });
    });
  });
});
