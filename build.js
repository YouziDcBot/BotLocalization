const fs = require("fs");
const yaml = require("yaml");
const { glob } = require("glob");
const path = require("path");

// 讀取 lang.json 文件
function readLangJson(filePath) {
    const file = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(file);
    return data.languages;
}

// 讀取 YAML 文件
function readYamlFile(filePath) {
    const file = fs.readFileSync(filePath, "utf8");
    const data = yaml.parse(file);
    return data;
}

// 處理特殊字符的轉義
function escapeSpecialChars(value) {
    return value
        .replace(/\\/g, '\\\\')  // 反斜線
        .replace(/\n/g, '\\n')    // 換行
        .replace(/\t/g, '\\t')    // 制表符
        .replace(/"/g, '\\"');    // 雙引號
}

// 寫入並格式化 YAML 文件
function writeYamlFile(filePath, data) {
    // 計算鍵的最大長度，以便進行對齊
    const keys = Object.keys(data);
    const maxKeyLength = Math.max(...keys.map(key => key.length));

    // 格式化 YAML 字串
    const formattedLines = keys.map(key => {
        let value = data[key];

        // 如果是字符串且不是數字，則加上引號並處理特殊字符
        if (typeof value === "string" && isNaN(value)) {
            value = `"${ escapeSpecialChars(value) }"`;
        }

        // 計算空格的數量，確保對齊
        const spaces = " ".repeat(maxKeyLength + 2 - key.length);
        return `${ key }:${ spaces }${ value }`;
    });

    // 將格式化好的 YAML 字串寫入文件
    const formattedYamlStr = formattedLines.join("\n");
    fs.writeFileSync(filePath, formattedYamlStr, "utf8");
}

// 讀取或初始化缺少的翻譯文件
function readOrInitMissingYamlFile(filePath) {
    if (fs.existsSync(filePath)) {
        return readYamlFile(filePath);
    }
    return {};
}

// 設定語言映射
const langJson = readLangJson(path.join(__dirname, "lang.json"));

// 讀取所有語言資料夾並進行格式化更新
glob("locate/*/!(*.missing).yml", { ignore: ["node_modules/**"] })
    .then(files => {
        const allData = {};

        // 讀取所有 YAML 文件並存儲數據
        files.forEach(fileName => {
            const data = readYamlFile(fileName);
            const [lang, namespace] = fileName.split(path.sep).slice(-2).map(name => path.basename(name, ".yml"));

            if (!allData[namespace]) {
                allData[namespace] = {};
            }
            allData[namespace][lang] = data;
        });

        // 檢查並填補缺失的翻譯
        Object.entries(allData).forEach(([namespace, langsData]) => {
            if (!langsData) return;

            const allKeys = new Set(Object.values(langsData).flatMap(data => data ? Object.keys(data) : []));
            const allLangs = Object.keys(langJson);

            allLangs.forEach(lang => {
                const data = langsData[lang] || {};
                const missingFilePath = path.join(__dirname, `locate/${ lang }/${ namespace }.missing.yml`);
                const missingData = readOrInitMissingYamlFile(missingFilePath);
                const updatedData = { ...data };

                allKeys.forEach(key => {
                    if (!(key in data)) {
                        missingData[key] = `# Missing: ${ key }`;
                    }
                });

                // 檢查 namespace 是否已經包含 '.missing'
                if (!namespace.endsWith('.missing')) {
                    writeYamlFile(path.join(__dirname, `locate/${ lang }/${ namespace }.yml`), updatedData);
                    if (Object.keys(missingData).length > 0) {
                        writeYamlFile(missingFilePath, missingData);
                    } else if (fs.existsSync(missingFilePath)) {
                        fs.unlinkSync(missingFilePath);
                    }
                } else {
                    writeYamlFile(path.join(__dirname, `locate/${ lang }/${ namespace }`), updatedData);
                }
                console.log(`已更新 locate/${ lang }/${ namespace }.yml 和 locate/${ lang }/${ namespace }.missing.yml`);
            });
        });
    });
