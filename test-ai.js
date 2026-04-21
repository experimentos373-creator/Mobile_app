const https = require('https');

const postData = JSON.stringify({
  message: "Oi",
  modelKey: "step-3-5"
});

const options = {
  hostname: 'mobileapp-taupe.vercel.app',
  port: 443,
  path: '/api/ai/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://mobileapp-taupe.vercel.app',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => { body += d; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(postData);
req.end();
