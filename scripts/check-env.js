const fs = require('fs');
const path = require('path');

const envExamplePath = path.resolve(__dirname, '..', '.env.example');
const envLocalPath = path.resolve(__dirname, '..', '.env.local');

const parseEnvKeys = (content) => {
    const keys = new Set();
    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const key = trimmedLine.split('=')[0].trim();
            if (key) {
                keys.add(key);
            }
        }
    });
    return keys;
};

const main = () => {
    console.log('正在校验环境变量...');

    if (!fs.existsSync(envExamplePath)) {
        // 如果连 example 文件都没有，无法校验，但允许通过，因为这可能是个特殊项目
        console.warn('警告: 未找到 .env.example 文件，跳过环境变量校验。');
        process.exit(0);
    }

    if (!fs.existsSync(envLocalPath)) {
        console.error('\n错误: 找不到 .env.local 文件！');
        console.error('请从 .env.example 复制一份并命名为 .env.local，然后填入您的本地配置。');
        console.error(`  cp .env.example .env.local`);
        process.exit(1);
    }

    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    const localContent = fs.readFileSync(envLocalPath, 'utf8');

    const requiredKeys = parseEnvKeys(exampleContent);
    const providedKeys = parseEnvKeys(localContent);

    const missingKeys = [];
    for (const key of requiredKeys) {
        if (!providedKeys.has(key)) {
            missingKeys.push(key);
        }
    }

    if (missingKeys.length > 0) {
        console.error('\n错误: 您的 .env.local 文件中缺少以下必需的环境变量:');
        missingKeys.forEach(key => console.error(`  - ${key}`));
        console.error('\n请将这些变量添加到您的 .env.local 文件中。');
        process.exit(1);
    }

    console.log('✅ 环境变量校验通过。\n');
    process.exit(0);
};

main(); 