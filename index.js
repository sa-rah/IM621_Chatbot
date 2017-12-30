'use strict';

const apiai = require('apiai');
const unsplash = require('unsplash-js');
const express = require('express');
const bodyParser = require('body-parser');

const TelegramBot = require('./telegrambot');
const TelegramBotConfig = require('./config');

const REST_PORT = (process.env.PORT || 3000);
const DEV_CONFIG = process.env.DEVELOPMENT_CONFIG == 'true';

const APP_NAME = process.env.APP_NAME;
const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN || "c715ce95287841e088cb160f8cb507ab";
const APIAI_LANG = process.env.APIAI_LANG || "en";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '521290062:AAHzzHBP-T5jhPW62fgYxr7ViJyMFpwDfUo';
const UNSPLASH_APP_ID = process.env.UNSPLASH_APP_ID || 'bc971ef99984d2d725007054f7dfef2da022b31c192fd1d27a4440c5330b3662';
const UNSPLASH_SECRET = process.env.UNSPLASH_SECRET || 'ae05302fda6cde434f1705dabf333e5b4d5210dddf9a4aef7c99a9e5b1251016';
const UNSPLASH_CALLBACK_URL = process.env.UNSPLASH_CALLBACK_URL || 'urn:ietf:wg:oauth:2.0:oob';

const botConfig = new TelegramBotConfig(
    APIAI_ACCESS_TOKEN,
    APIAI_LANG,
    TELEGRAM_TOKEN,
    UNSPLASH_APP_ID,
    UNSPLASH_SECRET,
    UNSPLASH_CALLBACK_URL);

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
    try {
        bot.processMessage(req, res);
    } catch (err) {
        return res.status(400).send('Error while processing ' + err.message);
    }
});

app.listen(REST_PORT, (req, res) => {
    res.send("This is the server part of the im621_pixxbot chatbot app for telegram.");
    console.log('Rest service ready on port ' + REST_PORT);
});