const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envLocalPath = path.resolve(__dirname, '..', '.env.local');

const getEnvMap = (content) => {
    const map = new Map();
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const firstEqualIndex = line.indexOf('=');
            if (firstEqualIndex !== -1) {
                const key = line.slice(0, firstEqualIndex).trim();
                const value = line.slice(firstEqualIndex + 1).trim();
                map.set(key, value);
            }
        }
    });
    return map;
};

const main = () => {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('错误: 请提供要设置的变量。');
        console.error('用法: npm run set-env KEY=VALUE or npm run set-env KEY --generate-secret');
        process.exit(1);
    }

    let key, value;
    const generateSecretFlagIndex = args.indexOf('--generate-secret');

    if (generateSecretFlagIndex !== -1) {
        if(args.length < 1 || args[0].includes('=')) {
            console.error('错误: 使用 --generate-secret 时，请只提供一个不带"="的KEY。');
            console.error('正确用法: npm run set-env YOUR_KEY --generate-secret');
            process.exit(1);
        }
        key = args[0];
        value = crypto.randomBytes(32).toString('hex');
        console.log(`为 ${key} 生成了一个新的密钥。`);

    } else {
        const firstArg = args[0];
        const parts = firstArg.split('=');
        if (parts.length < 2 || !parts[0]) {
            console.error('错误: 格式不正确。请使用 KEY=VALUE 格式。');
            console.error('正确用法: npm run set-env KEY=VALUE');
            process.exit(1);
        }
        key = parts[0].trim();
        value = parts.slice(1).join('=').trim();
    }

    if (!key) {
        console.error('错误: 键不能为空。');
        process.exit(1);
    }
    
    let envContent = '';
    if (fs.existsSync(envLocalPath)) {
        envContent = fs.readFileSync(envLocalPath, 'utf8');
    }

    const envMap = getEnvMap(envContent);
    envMap.set(key, value);

    const newEnvContent = Array.from(envMap.entries())
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');

    fs.writeFileSync(envLocalPath, newEnvContent);
    console.log(`成功将 ${key} 更新到 .env.local 文件中。`);
};

main(); 