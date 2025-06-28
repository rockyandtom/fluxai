const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxy = 'http://127.0.0.1:7890';
const agent = new HttpsProxyAgent(proxy);

https.get('https://accounts.google.com', { agent }, (res) => {
  console.log('statusCode:', res.statusCode);
}).on('error', (err) => {
  console.error('error:', err);
}); 