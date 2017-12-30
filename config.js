'use strict';

module.exports = class TelegramBotConfig {

    get apiaiAccessToken() {
        return this._apiaiAccessToken;
    }

    set apiaiAccessToken(value) {
        this._apiaiAccessToken = value;
    }

    get apiaiLang() {
        return this._apiaiLang;
    }

    set apiaiLang(value) {
        this._apiaiLang = value;
    }

    get telegramToken() {
        return this._telegramToken;
    }

    set telegramToken(value) {
        this._telegramToken = value;
    }

    get unsplashAppId() {
        return this._unsplashAppId;
    }

    set unsplashAppId(value) {
        this._unsplashAppId = value;
    }

    get unsplashSecret() {
        return this._unsplashSecret;
    }

    set unsplashSecret(value) {
        this._unsplashSecret = value;
    }

    get unsplashCallbackUrl() {
        return this._unsplashCallbackUrl;
    }

    set unsplashCallbackUrl(value) {
        this._unsplashCallbackUrl = value;
    }

    get devConfig() {
        return this._devConfig;
    }

    set devConfig(value) {
        this._devConfig = value;
    }

    constructor(apiaiAccessToken, apiaiLang, telegramToken, unsplashAppId, unsplashSecret, unsplashCallbackUrl) {
        this._apiaiAccessToken = apiaiAccessToken;
        this._apiaiLang = apiaiLang;
        this._telegramToken = telegramToken;
        this._unsplashAppId = unsplashAppId;
        this._unsplashSecret = unsplashSecret;
        this._unsplashCallbackUrl = unsplashCallbackUrl;
    }

    toPlainDoc() {
        return {
            apiaiAccessToken: this._apiaiAccessToken,
            apiaiLang: this._apiaiLang,
            telegramToken: this._telegramToken,
            unsplashAppId: this._unsplashAppId,
            unsplashSecret: this._unsplashSecret,
            unsplashCallbackUrl: this._unsplashCallbackUrl
        }
    }

    static fromPlainDoc(doc){
        return new TelegramBotConfig(
            doc.apiaiAccessToken,
            doc.apiaiLang,
            doc.telegramToken,
            doc.unsplashAppId,
            doc.unsplashSecret,
            doc.unsplashCallbackUrl);
    }
};