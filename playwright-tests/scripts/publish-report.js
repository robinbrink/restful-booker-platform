// Copies the latest run's reports into reports/latest/ so they can be committed and read
// without running the tests. Run after `npm test`:  npm run report:publish
const fs = require('fs');
const path = require('path');

const out = path.join('reports', 'latest');
const need = ['playwright-report', 'test-results.json', 'test-results.xml'];
const missing = need.filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error('Missing ' + missing.join(', ') + '. Run "npm test" first (without a --reporter option).');
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync('playwright-report', path.join(out, 'html'), { recursive: true });
fs.copyFileSync('test-results.xml', path.join(out, 'junit.xml'));
fs.copyFileSync('test-results.json', path.join(out, 'results.json'));
// Keep line endings untouched so the HTML report is not corrupted by git
fs.writeFileSync(path.join('reports', '.gitattributes'), '* -text\n');

require('./summary.js'); // refresh TEST_RESULTS.md from the same run
fs.copyFileSync('TEST_RESULTS.md', path.join(out, 'TEST_RESULTS.md'));
console.log('Published to ' + out + ' (open ' + path.join(out, 'html', 'index.html') + ')');
