const { i18next, initI18next,t } = require('./i18n');
// i18n 示例
(async () => {
    await initI18next();
    await i18next.changeLanguage('zh_tw');
    console.log(i18next.t('package.i18n.done'));
})();