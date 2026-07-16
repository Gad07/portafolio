const https = require('https');
const fs = require('fs');

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  }
};

function getSVG(url) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getSVG(res.headers.location));
      }
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  try {
    const treble = await getSVG('https://upload.wikimedia.org/wikipedia/commons/3/3f/Treble_clef.svg');
    const bass = await getSVG('https://upload.wikimedia.org/wikipedia/commons/6/62/Bass_clef.svg');
    const note = await getSVG('https://upload.wikimedia.org/wikipedia/commons/e/e6/Eighth_note_with_upwards_stem.svg');
    
    // SVG might have multiple paths. Let's just write the whole files and then parse them.
    fs.writeFileSync('treble.svg', treble);
    fs.writeFileSync('bass.svg', bass);
    fs.writeFileSync('note.svg', note);
    console.log("SVGs downloaded successfully.");
  } catch(e) {
    console.error(e);
  }
}
run();
