'use strict';

const apiai = require('apiai');
const uuid = require('node-uuid');
const request = require('request');
const giphy = require('giphy-js-sdk-core');
const toJson = require('unsplash-js').default.toJson;
const fetch = require('isomorphic-fetch');

module.exports = class TelegramBot {

    get apiaiService() {
        return this._apiaiService;
    }

    set apiaiService(value) {
        this._apiaiService = value;
    }

    get giphyService() {
        return this._giphyService;
    }

    set giphyService(value) {
        this._giphyService = value;
    }

    get authentificationUrl() {
        return this._authenticationUrl;
    }

    set authentificationUrl(value) {
        this._authenticationUrl = value;
    }

    get botConfig() {
        return this._botConfig;
    }

    set botConfig(value) {
        this._botConfig = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(botConfig, baseUrl) {
        this._botConfig = botConfig;
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "telegram"
        };

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions);
        this._giphyService = new giphy(botConfig.giphyAccessToken);

        this._sessionIds = new Map();

        this._webhookUrl = baseUrl + '/webhook';
        console.log('Starting bot on ' + this._webhookUrl);

        this._telegramApiUrl = 'https://api.telegram.org/bot' + botConfig.telegramToken;
    }

    start(responseCallback, errCallback){
        // https://core.telegram.org/bots/api#setwebhook
        request.post(this._telegramApiUrl + '/setWebhook', {
            json: {
                url: this._webhookUrl
            }
        }, function (error, response, body) {

            if (error) {
                console.error('Error while /setWebhook', error);
                if (errCallback){
                    errCallback(error);
                }
                return;
            }

            if (response.statusCode != 200) {
                console.error('Error status code while /setWebhook', body);
                if (errCallback) {
                    errCallback('Error status code while setWebhook ' + body);
                }
                return;
            }

            console.log('Method /setWebhook completed', body);
            if (responseCallback) {
                responseCallback('Method /setWebhook completed ' + body)
            }
        });
    }

    processMessage(req, res) {
        if (this._botConfig.devConfig) {
            console.log("body", req.body);
        }

        let updateObject = req.body;

        if (updateObject && updateObject.message) {
            let msg = updateObject.message;

            var chatId;

            if (msg.chat) {
                chatId = msg.chat.id;
            }

            let messageText = msg.text;

            if (chatId && messageText) {
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }

                let apiaiRequest = this._apiaiService.textRequest(messageText,
                    {
                        sessionId: this._sessionIds.get(chatId)
                    });

                apiaiRequest.on('response', (response) => {
                    console.log("HOOKRESPONSE:");
                    console.log(response.result.fulfillment.speech);
                    if (TelegramBot.isDefined(response.result)) {
                       this.replyText({
                           chat_id: chatId,
                           msg: response.result.fulfillment.speech
                       });
                       TelegramBot.createResponse(res, 200, 'Reply sent');
                    } else {
                        TelegramBot.createResponse(res, 200, 'Received empty result');
                    }
                });

                apiaiRequest.on('error', (error) => {
                    TelegramBot.createResponse(res, 200, 'Error while call to api.ai');
                });
                apiaiRequest.end();
            }
            else {
                return TelegramBot.createResponse(res, 200, 'Empty message');
            }
        } else {
            return TelegramBot.createResponse(res, 200, 'Empty message');
        }
    }

    processResponse(req, res){
        if (this._botConfig.devConfig) {
            console.log("body", req.body);
        }

        let updateObject = req.body;

        if (updateObject && updateObject.result.resolvedQuery) {
            let responseParameters = updateObject.result.parameters;
            console.log(responseParameters);

            this.checkResponseParameters(req, res, responseParameters);
        }
    }

    checkResponseParameters(req, res, responseParameters) {
        console.log("PARAMETERMETHOD")

        if(TelegramBot.isDefined(responseParameters.gif)){
            if(TelegramBot.isDefined(responseParameters.keyword)){
                this._giphyService.search('gifs', {"q": responseParameters.keyword, "limit": 1})
                    .then((response) => {
                        console.log(response.data);
                        var gifs = [];
                        response.data.forEach((gifObject) => {
                            gifs.push(gifObject.url);
                        });
                        console.log(gifs);
                        res.send({ "speech": gifs });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                this._giphyService.random('gifs', {})
                    .then((response) => {
                        console.log(response);
                        res.send({ "speech": response.data.url });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (TelegramBot.isDefined(responseParameters.sticker)) {
            if(TelegramBot.isDefined(responseParameters.keyword)){
                this._giphyService.search('stickers', {"q": responseParameters.keyword})
                    .then((response) => {
                        console.log("Keyword:" + response.data);
                        res.send({ "speech": response.data.url });
                        /*response.data.forEach((gifObject) => {

                        })*/
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                this._giphyService.random('stickers', {})
                    .then((response) => {
                        console.log("Random:" + response);
                        res.send({ "speech": response.data.url });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (TelegramBot.isDefined(responseParameters.user)) {

        } else {
            res.send(200);
        }
    }

    replyText(msg) {
        console.log(msg);
        request.post(this._telegramApiUrl + '/sendMessage', {
            json: { "chat_id": msg.chat_id, "text": msg.msg }
        }, function (error, response, body) {
            if (error) {
                console.error('Error while /sendMessage', error);
                return;
            }
            if (response.statusCode != 200) {
                console.error('Error status code while /sendMessage', body);
                return;
            }
            console.log('Method /sendMessage succeeded');
        });
    }

    replyGif(msg) {
        request.post(this._telegramApiUrl + '/sendDocument', {
            json: { "chat_id": msg.chat_id, "document": msg.msg }
        }, function (error, response, body) {
            if (error) {
                console.error('Error while /sendMessage', error);
                return;
            }
            if (response.statusCode != 200) {
                console.error('Error status code while /sendMessage', body);
                return;
            }
            console.log('Method /sendMessage succeeded');
        });
    }

    replyPhoto(msg) {
        request.post(this._telegramApiUrl + '/sendPhoto', {
            json: { "chat_id": msg.chat_id, "photo": msg.msg }
        }, function (error, response, body) {
            if (error) {
                console.error('Error while /sendMessage', error);
                return;
            }
            if (response.statusCode != 200) {
                console.error('Error status code while /sendMessage', body);
                return;
            }
            console.log('Method /sendMessage succeeded');
        });
    }

    static createResponse(resp, code, message) {
        return resp.status(code).json({
            status: {
                code: code,
                message: message
            }
        });
    }

    static isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    }
}