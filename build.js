const fs = require('fs');
const path = require('path');

console.log('Building standalone single-file release...');

let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, 'css', 'styles.css'), 'utf-8');
const audioJs = fs.readFileSync(path.join(__dirname, 'js', 'audio.js'), 'utf-8');
const entropyJs = fs.readFileSync(path.join(__dirname, 'js', 'entropy.js'), 'utf-8');
const deathrollJs = fs.readFileSync(path.join(__dirname, 'js', 'deathroll.js'), 'utf-8');
const appJs = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf-8');

// Replace external CSS link with inline <style>
html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    `<style>\n${css}\n</style>`
);

// Replace external JS script tags with inline <script>
const scriptTags = [
    '<script src="js/audio.js"></script>',
    '<script src="js/entropy.js"></script>',
    '<script src="js/deathroll.js"></script>',
    '<script src="js/app.js"></script>'
].join('\n    ');

const inlineScript = `<script>\n${audioJs}\n\n${entropyJs}\n\n${deathrollJs}\n\n${appJs}\n</script>`;

html = html.replace(scriptTags, inlineScript);

const outputPath = path.join(__dirname, 'truerandom-standalone.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log(`✓ Successfully bundled into standalone file: truerandom-standalone.html (${(html.length / 1024).toFixed(1)} KB)`);
console.log('  This single file can be downloaded and run directly in any browser with zero dependencies!');
