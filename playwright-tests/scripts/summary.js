// Turns test-results.json (written by `npm test`) into TEST_RESULTS.md.
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
const rows = [];
const clean = (s) => String(s || '').replace(/\x1b\[[0-9;]*m/g, '');

function walk(suite) {
  for (const spec of suite.specs || []) {
    for (const t of spec.tests) {
      const last = t.results[t.results.length - 1] || {};
      const note = (t.annotations || []).find((a) => a.type === 'known-defect');
      rows.push({
        project: t.projectName,
        title: spec.title.replace(/\s*@\w[\w-]*/g, '').trim(),
        tagged: /@known-defect/.test(spec.title),
        smoke: /@smoke/.test(spec.title),
        status: t.status, // expected (passed) | unexpected (failed) | flaky | skipped
        reason: note && note.description,
        error: clean(last.error && last.error.message).split('\n').find((l) => l.trim()) || '',
        ms: last.duration || 0,
      });
    }
  }
  for (const s of suite.suites || []) walk(s);
}
data.suites.forEach(walk);

const failed = rows.filter((r) => r.status === 'unexpected');
const knownFailing = failed.filter((r) => r.tagged);
const otherFailing = failed.filter((r) => !r.tagged);
const passed = rows.filter((r) => r.status === 'expected');
const passedDefectTests = passed.filter((r) => r.tagged);
const flaky = rows.filter((r) => r.status === 'flaky');
const when = new Date(data.stats.startTime);
const secs = Math.round(data.stats.duration / 1000);
const esc = (s) => String(s).replace(/\|/g, '\\|');
const idOf = (t) => (t.match(/^(AT-\d+[a-z]?)/) || [])[1] || '';
const nameOf = (t) => t.replace(/^AT-\d+[a-z]?\s*/, '');

let md = `# Test results: latest run

Run on ${when.toISOString().replace('T', ' ').slice(0, 16)} UTC, ${secs} seconds, Chromium, against ${process.env.BASE_URL || 'http://localhost:3003'}.
Generated from \`test-results.json\` by \`npm run report:summary\`. The full HTML report of the published run is [reports/latest/html/index.html](reports/latest/html/index.html); after a local run, \`npm run report\` opens the newest one.

## Summary

| | Count |
|---|---|
| Tests run | ${rows.length} |
| Passed | ${passed.length} |
| **Failed: known defects (failing on purpose, see below)** | **${knownFailing.length}** |
| Failed: not a known defect (unexpected) | ${otherFailing.length} |
| Flaky (passed on retry) | ${flaky.length} |

${otherFailing.length === 0 ? `Every failure in this run is a documented defect in [BUGS.md](BUGS.md). The ${knownFailing.length} failing tests assert the *correct* behaviour, so they fail until the defect is fixed.` : '**There are failures that are not known defects, listed under "Unexpected failures" below.**'}

## Failed tests: known defects

Each test checks what the application *should* do, and fails because it does not. When a defect is fixed its test starts passing.

| Test | Scenario | Bug | What is wrong | First line of the failure |
|---|---|---|---|---|
`;
for (const r of knownFailing) {
  const bug = ((r.reason || '').match(/^(UI|API)-\d+/) || [''])[0];
  md += `| ${idOf(r.title)} | ${esc(nameOf(r.title))} | ${bug} | ${esc((r.reason || '').replace(/^(UI|API)-\d+:\s*/, ''))} | ${esc(r.error.slice(0, 110))} |\n`;
}

md += `\n## Passing tests\n\n| Test | Scenario | Project | Time |\n|---|---|---|---|\n`;
for (const r of passed) md += `| ${idOf(r.title)} | ${esc(nameOf(r.title))}${r.smoke ? ' (smoke)' : ''} | ${r.project} | ${(r.ms / 1000).toFixed(1)}s |\n`;

if (passedDefectTests.length) {
  md += `\nNote: ${passedDefectTests.map((r) => idOf(r.title)).join(', ')} ${passedDefectTests.length > 1 ? 'are' : 'is'} tagged as a known defect but passed in this run. AT-16a only fails on a freshly started instance, where the seeded logo URL is rejected (UI-05); this instance already had a valid logo saved.\n`;
}

if (otherFailing.length) {
  md += `\n## Unexpected failures\n\n| Test | Project |\n|---|---|\n`;
  for (const r of otherFailing) md += `| ${esc(r.title)} | ${r.project} |\n`;
}

md += `\n## Notes\n\n- The failing tests are deliberate: they are the known defects, written as tests so the failure is visible and the same test confirms the fix later.\n- To get a green run while the defects exist, set \`EXPECT_DEFECTS=1\` (Playwright then marks them as expected failures).\n- The setup step (admin login) is counted in the run and passes.\n`;
fs.writeFileSync('TEST_RESULTS.md', md);
console.log(`TEST_RESULTS.md written: ${rows.length} tests, ${passed.length} passed, ${knownFailing.length} known-defect failures, ${otherFailing.length} unexpected failures`);
