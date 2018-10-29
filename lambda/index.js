/**
 * Dependencies.
 */
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const GitHubApi = require('./github-api');

/**
 * User Events handler.
 */
const GithubHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GithubIntent');
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

    // Extract slot values.
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const username = slots.username.value.replace(/\s+/g, '').toLowerCase();

    // Fetch user event from GitHub API.
    const response = await GitHubApi.getUserEvents({
      'username': username,
    });

    // Build speak output from API response.
    const speakOutput = requestAttributes.t('USER_EVENTS_RESULT_INTRO', username);
    let speakList = [];
    response.forEach(result => {
      if (result.payload.commits) {
        result.payload.commits.forEach(commit => {
          speakList.push('commit for ' + result.repo.name + ' ' + commit.message);
        });
      }
    });

    return handlerInput.responseBuilder
      .speak(speakOutput + '. ' + speakList.slice(0, 2).join('. '))
      .withSimpleCard(speakOutput)
      .getResponse();
  },
};

/**
 * Help handler.
 */
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_MESSAGE'))
      .getResponse();
  },
};

/**
 * Exit handler.
 */
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

/**
 * Session ended request handler.
 */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

/**
 * Error handler.
 */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

/**
 * Fallback handler.
 *
 * 2018-Aug-01: AMAZON.FallbackIntent is only currently available in en-* locales.
 * This handler will not be triggered except in those locales, so it can be
 * safely deployed for any locale.
 */
const FallbackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_MESSAGE'))
      .getResponse();
  },
};

/**
 * Finding the locale of the user.
 */
const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

/**
 * Setup Lambda.
 */
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    GithubHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();

/**
 * Constants.
 */
const languageStrings = {
  en: {
    translation: {
      SKILL_NAME: 'Code Activity',
      WELCOME_MESSAGE: 'Welcome to %s.',
      HELP_MESSAGE: 'You can say things like, ask Code Activity for commits from user',
      STOP_MESSAGE: 'Goodbye!',
      ERROR_MESSAGE: 'Sorry, I can\'t understand the command. Please say again.',
      USER_EVENTS_RESULT_INTRO: 'Here is the latest activity for %s',
    },
  },
};
