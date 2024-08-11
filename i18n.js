const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
// const yaml = require('yaml');
// const fs = require('fs');
const path = require('path');
let hasInitialized = false;

async function initI18next() {
    await
        i18next
            .use(Backend)
            .init({
                backend: {
                    loadPath: path.resolve(__dirname, 'locate/{{lng}}.yml'),
                    addPath: path.resolve(__dirname, 'locate/{{lng}}.missing.yml'),
                },
                debug: false,
                saveMissing: true,
                saveMissingTo: 'all',
                fallbackLng: 'zh_TW',
                initImmediate: false,
                interpolation: { escapeValue: false },
                load: 'all',
                ns: 'default',
                defaultNS: 'default',
                defaultValue: '# Missing translation',
                preload: Object.keys(require('./lang.json').languages),
            })
            .then(() => {
                hasInitialized = true;
            });
}

async function translation(lang = 'zh_TW', msg, ...args) {
    if (!hasInitialized) await initI18next();
    // await i18next.changeLanguage(lang);
    return i18next.t(msg, {
        lng: lang || 'zh_TW',
        fallbackLng: 'zh_TW',
        defaultValue: '# Missing translation: ' + msg,
        ...args
    });
}

const t = i18next.t;

module.exports = { i18next, initI18next, t, translation };