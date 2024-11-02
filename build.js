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

// 寫入 YAML 文件
function writeYamlFile(filePath, data) {
    const yamlStr = yaml.stringify(data, {
        lineWidth: -1 // Disable line wrapping
    });
    // 提取所有鍵以計算最大長度
    const keys = Object.keys(data);
    const maxKeyLength = Math.max(...keys.map(key => key.length));

    // 確保每行目標字符寬
    const formattedYamlStr = yamlStr.replace(
        /^( *)(.*?): (.*?)$/gm,
        (match, indent, key, value) => {
            // 檢查值是否已經被引號包圍
            if (!/^".*"$/.test(value) && !/^-?\d+(\.\d+)?$/.test(value)) {
                value = `"${ value }"`;
            }
            return `${ indent }${ key }${ " ".repeat(maxKeyLength + 2 - key.length) }: ${ value }`;
        }
    );

    fs.writeFileSync(filePath, formattedYamlStr, "utf8");
}

const baseTrans = readYamlFile(path.join(__dirname, "locate/zh-tw.yml"));
const langJson = readLangJson(path.join(__dirname, "lang.json"));

// 添加缺失的翻譯項目
function addMissingTranslations(existingData, baseTranslations) {

    const updatedTranslations = { lang: langJson[fileBaseName], ...existingData };
    for (const [key, value] of Object.entries(baseTranslations)) {
        if (!(key in updatedTranslations)) {
            updatedTranslations[key] = `# Missing: ${ value }`; // 標記為缺失項
        }
    }
    return updatedTranslations;
}

// 讀取所有 YAML 文件
glob("locate/**/*.yml", { ignore: "node_modules/**" })
    .then(files => {
        files.forEach(fileName => {
            // 讀取
            const data = readYamlFile(fileName);
            console.log(`正在格式化 ${ fileName }`);

            // 更新
            const fileBaseName = path.basename(fileName, ".yml");
            const updatedData = { lang: langJson[fileBaseName], ...data };
            for (const [key, value] of Object.entries(baseTrans)) {
                if (!(key in updatedData)) {
                    updatedData[key] = `# Missing: ${ value }`; // 標記為缺失項
                }
            }

            // 寫入
            writeYamlFile(fileName, updatedData);
            console.log(`已更新 ${ fileName }`);

        });
    });

