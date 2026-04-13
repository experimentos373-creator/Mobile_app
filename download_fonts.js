const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'assets', 'fonts');
if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

const FONTS = [
  { name: 'lexend', url: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap' },
  { name: 'material-symbols', url: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' }
];

// High-end Chrome User-Agent to force Google to serve WOFF2 variable fonts
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const fetchUrl = (url) => new Promise((resolve, reject) => {
  https.get(url, { headers: { 'User-Agent': CHROME_UA } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

const downloadFile = (url, dest) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => { file.close(); resolve(); });
  }).on('error', err => { fs.unlink(dest, () => reject(err)); });
});

async function processFonts() {
  for (const font of FONTS) {
    console.log(`Fetching CSS for ${font.name}...`);
    let css = await fetchUrl(font.url);

    // Support both .woff2 and .ttf in the search. Look for url(https://...)
    // Google fonts often use url(https://...) format.
    const urlRegex = /url\((https:\/\/[^)]+\.(woff2|ttf|otf))\)/g;
    const matches = [...css.matchAll(urlRegex)];
    console.log(`Found ${matches.length} font files for ${font.name}`);

    let count = 0;
    for (const match of matches) {
      const fontUrl = match[1];
      const extension = match[2];
      const filename = `${font.name}_${count}.${extension}`;
      const dest = path.join(FONTS_DIR, filename);

      console.log(`Downloading ${filename}...`);
      await downloadFile(fontUrl, dest);
      
      // Replace absolute URL with relative local path
      css = css.replace(fontUrl, `../assets/fonts/${filename}`);
      count++;
    }

    const cssPath = path.join(__dirname, 'css', `${font.name}.css`);
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log(`Saved CSS to ${cssPath}\n`);
  }
}

processFonts().catch(console.error);
