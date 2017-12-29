'use strict';

const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');

const TelegramBot = require('./telegrambot');
const TelegramBotConfig = require('./config');

const REST_PORT = (process.env.PORT || 5000);
const DEV_CONFIG = process.env.DEVELOPMENT_CONFIG == 'true';

const APP_NAME = process.env.APP_NAME;
const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN || "c715ce95287841e088cb160f8cb507ab";
const APIAI_LANG = process.env.APIAI_LANG || "en";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '521290062:AAHzzHBP-T5jhPW62fgYxr7ViJyMFpwDfUo';

const botConfig = new TelegramBotConfig(
    APIAI_ACCESS_TOKEN,
    APIAI_LANG,
    TELEGRAM_TOKEN);

botConfig.devConfig = DEV_CONFIG;

const bot = new TelegramBot(botConfig, "https://im621-pixx-bot.herokuapp.com");
bot.start(() => {
        console.log("Bot started");
    },
    (errStatus) => {
        console.error('It seems the TELEGRAM_TOKEN is wrong! Please fix it.')
    });


const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    console.log('POST webhook');

    try {
        bot.processMessage(req, res);
    } catch (err) {
        return res.status(400).send('Error while processing ' + err.message);
    }
});

app.listen(REST_PORT, function () {
    console.log('Rest service ready on port ' + REST_PORT);
});