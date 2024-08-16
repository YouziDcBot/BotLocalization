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

/**
 * TO-DO: 
 * 名稱轉換器，用於將不同命名法的名稱轉換為其他命名法的名稱。
 * 讓翻譯格式更加統一，但輸入的方式可以是不同的命名法。
 */

// enum NamingConvention {
//     CamelCase = "camelCase",
//     SnakeCase = "snake_case",
//     KebabCase = "kebab-case",
//     PascalCase = "PascalCase",
//     SpaceCase = "space case",
// }

// function convertNaming(input: string, outputConvention: NamingConvention): string {

//     const words = input
//         .replace(/([a-z])([A-Z])/g, "$1 $2") // ...aB... -> ...a B...
//         .replace(/[-_ ]+/g, " ") // ...a_B... -> ...a B...
//         .replace(/([a-zA-Z])([0-9])/g, "$1 $2") // ...a0... -> ...a 0...
//         .replace(/([0-9])([a-zA-Z])/g, "$1 $2") // ...0a... -> ...0 a...
//         .toLowerCase()
//         .split(" ");

//     switch (outputConvention) {
//         case NamingConvention.CamelCase:
//             return words
//                 .map((word, index) =>
//                     index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
//                 )
//                 .join("");

//         case NamingConvention.SnakeCase:
//             return words.join("_");

//         case NamingConvention.KebabCase:
//             return words.join("-");

//         case NamingConvention.PascalCase:
//             return words
//                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//                 .join("");

//         case NamingConvention.SpaceCase:
//             return words.join(" ");

//         default:
//             return input;
//     }
// }
