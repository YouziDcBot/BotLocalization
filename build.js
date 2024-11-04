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

// 設定基本翻譯文件和語言映射
const baseTrans = readYamlFile(path.join(__dirname, "locate/zh-TW.yml"));
const langJson = readLangJson(path.join(__dirname, "lang.json"));

// 讀取所有 YAML 文件並進行格式化更新
glob("locate/**/*.yml", { ignore: ["node_modules/**", "locate/**/*.missing.yml"] })
    .then(files => {
        files.forEach(fileName => {
            // 讀取 YAML 文件
            const data = readYamlFile(fileName);
            console.log(`正在格式化 ${ fileName }`);

            // 更新語言鍵並標記缺失的翻譯
            const fileBaseName = path.basename(fileName, ".yml");
            const updatedData = { lang: langJson[fileBaseName], ...data };
            for (const [key, value] of Object.entries(baseTrans)) {
                if (!(key in updatedData)) {
                    updatedData[key] = `# Missing: ${ value }`; // 標記缺失翻譯
                }
            }

            // 寫入格式化的 YAML 文件
            writeYamlFile(fileName, updatedData);
            console.log(`已更新 ${ fileName }`);
        });
    });
