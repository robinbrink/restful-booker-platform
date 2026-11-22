// Marks a test as a known defect. The test asserts the CORRECT behaviour, so it FAILS while the
// defect exists, and the report shows it as failed on purpose. The bug id and reason are attached
// to the test as an annotation so they appear in the report.
//
// Optional: set EXPECT_DEFECTS=1 to mark these tests as expected failures (Playwright test.fail()),
// which gives a green run while the defects exist and turns a test red once its defect is fixed.
function knownDefect(test, reason) {
  test.info().annotations.push({ type: 'known-defect', description: reason });
  if (process.env.EXPECT_DEFECTS) test.fail(true, reason);
}

module.exports = { knownDefect };
