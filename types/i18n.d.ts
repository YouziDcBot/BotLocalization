import i18next = require("i18next");
export function initI18next(): Promise<void>;
export const t: i18next.TFunction<["translation", ...string[]], undefined>;
export function translation(lang: string, msg: any, ...args: any[]): Promise<string>;
export { i18next };
