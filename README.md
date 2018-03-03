# Tailor news

## Abstract

This has been released to share the code presented during [Voice Tech TO #3](https://www.meetup.com/voice-tech-to/events/247849388/)
Voice Tech TO is a Toronto based event exploring Google Home, Amazon Alexa, and the wide world of voice.

Voice Tech TO #3 was workshop on the setup for building for voice.
The repository holds the code that was used as an illustration in the meetup.

> This tutorial was written on a Mac architecture, please make the necessary adjustment if the code is used on another architecture.

## Description

Tailor news is the idea of a voice skill that will fetch the top headline on a user inputted topic.

#### Requirements

A machine equiped with
* a [https://developer.amazon.com](http://developer.amazon.com) account
* an [https://console.aws.amazon.com](https://console.aws.amazon.com) account (keep the AWS secret and user ID that will be given at the end)
* [aws-cli](https://aws.amazon.com/cli/) installed
* [Node](https://docs.npmjs.com/getting-started/installing-node)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/)
* [ask-cli](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)

#### Setup

###### Installation

```
# build the lambda
cd lambda/custom
yarn
```

###### Test

* command:
```
# from the lambda directory
cd lambda/custom # if not already in the directory
yarn test
```
* expected output:
```
  Handlers testing
    Launch request
      ✓ should send back a speak, listen response (9ms)
    News Inquiry Intent
      ✓ should return the summary of the top article for a category (9ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

##### Deploy

> Execute the following from the repository root directory

* make a local copy of the [ask config](./docs/data/ask-config-example.json) in the current directory under `.ask/config` (create the .ask directory)
* update the skill id and lambda arn in the previously created file.
* `ask-cli deploy`

## Next steps

#### Features

A list of features to make has been shared on the Voice Tech TO slack channel ([https://goo.gl/hNZryK](https://goo.gl/hNZryK))

#### Code

the integration tests should include tests for bad / malformed data.

## License

MIT

## Readings

* [https://developer.amazon.com/alexa-skills-kit/design](https://developer.amazon.com/alexa-skills-kit/design)
* [https://github.com/alexa/alexa-cookbook](https://github.com/alexa/alexa-cookbook)
