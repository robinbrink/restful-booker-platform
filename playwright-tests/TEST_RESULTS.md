# Test results: latest run

Run on 2026-11-22 17:53 UTC, 119 seconds, Chromium, against http://localhost:3003.
Generated from `test-results.json` by `npm run report:summary`. The full HTML report of the published run is [reports/latest/html/index.html](reports/latest/html/index.html); after a local run, `npm run report` opens the newest one.

## Summary

| | Count |
|---|---|
| Tests run | 33 |
| Passed | 20 |
| **Failed: known defects (failing on purpose, see below)** | **13** |
| Failed: not a known defect (unexpected) | 0 |
| Flaky (passed on retry) | 0 |

Every failure in this run is a documented defect in [BUGS.md](BUGS.md). The 13 failing tests assert the *correct* behaviour, so they fail until the defect is fixed.

## Failed tests: known defects

Each test checks what the application *should* do, and fails because it does not. When a defect is fixed its test starts passing.

| Test | Scenario | Bug | What is wrong | First line of the failure |
|---|---|---|---|---|
| AT-04b | every guest form message names the field it is about | UI-07 | messages such as "size must be between 11 and 21" and "must not be empty" do not name their field | Error: an error message should mention /email/i |
| AT-05 | booking dates that are already taken shows a clear message | UI-01 | the page crashes ("This page couldn't load") instead of showing a message | Error: expect(locator).toBeVisible() failed |
| AT-06 | /reservation/9999?checkin=2032-01-01&checkout=2032-01-03 shows a not-found message | UI-02 | the page crashes instead of showing a not-found message | Error: expect(locator).toBeVisible() failed |
| AT-06 | /reservation/abc shows a not-found message | UI-02 | the page crashes instead of showing a not-found message | Error: expect(locator).toBeVisible() failed |
| AT-07a | searching with dates in the past is not allowed | UI-04 | past dates are accepted and rooms are offered | Error: expect(received).toEqual(expected) // deep equality |
| AT-07b | check-out before check-in is not allowed | UI-04 | reversed dates are accepted and rooms are offered | Error: expect(received).toEqual(expected) // deep equality |
| AT-22 | the new-booking message tells the admin which room was booked | UI-08 | the message has the guest and dates but no room number or type | Error: expect(locator).toBeVisible() failed |
| AT-16b | a saved B&B name shows on the public site within 10 seconds | UI-09 | /api/branding is cached for 60 seconds and the save does not clear it | Error: expect(received).toBe(expected) // Object.is equality |
| AT-12 | a room created by admin is listed in admin and on the public site | UI-03 | the home page shows only the first three rooms (rooms.slice(0, 3)) | Error: expect(locator).toHaveCount(expected) failed |
| AT-14a | empty room form says what is missing | UI-07 | the only message is "Failed to create room" | Error: expect(locator).toContainText(expected) failed |
| AT-14b | a decimal price says what is wrong | UI-07 | the only message is "Failed to create room" | Error: expect(locator).toContainText(expected) failed |
| AT-23 | a room number that already exists cannot be created again | UI-10 | the duplicate room is created with no error | Error: expect(locator).toBeVisible() failed |
| AT-15 | deleting a room that has a booking asks for confirmation | UI-06 | the room is deleted immediately, with no confirmation or warning | Error: expect(received).toBe(expected) // Object.is equality |

## Passing tests

| Test | Scenario | Project | Time |
|---|---|---|---|
|  | log in as admin and save the session | setup | 1.5s |
| AT-10a | valid credentials open the rooms page (smoke) | guest | 2.3s |
| AT-10b | wrong password is rejected with a message | guest | 0.9s |
| AT-10c | empty username and password are rejected | guest | 0.9s |
| AT-11a | /admin/rooms shows the login form, not admin data (smoke) | guest | 0.9s |
| AT-11a | /admin/message shows the login form, not admin data (smoke) | guest | 1.0s |
| AT-11a | /admin/report shows the login form, not admin data (smoke) | guest | 1.0s |
| AT-11a | /admin/branding shows the login form, not admin data (smoke) | guest | 0.9s |
| AT-11b | after logging out, Back does not show admin data | guest | 1.3s |
| AT-02 | guest searches, books a room and sees the confirmation (smoke) | guest | 3.7s |
| AT-03 | price summary adds nights, cleaning fee and service fee | guest | 1.3s |
| AT-04 | empty guest form shows a message for every field | guest | 1.5s |
| AT-09a | empty form shows a message for every field | guest | 1.0s |
| AT-09b | values outside the allowed format and length are rejected | guest | 1.0s |
| AT-01 | home page loads with the three rooms and no errors (smoke) | guest | 1.0s |
| AT-08 | a guest contact message appears in admin, unread until opened (smoke) | admin | 3.3s |
| AT-17 | a guest booking appears on the admin report | admin | 1.6s |
| AT-16a | branding saves when only the B&B name is changed | admin | 1.9s |
| AT-13 | editing a room price and description persists | admin | 3.4s |
| AT-14c | price outside 1 to 999 is rejected | admin | 1.8s |

Note: AT-16a is tagged as a known defect but passed in this run. AT-16a only fails on a freshly started instance, where the seeded logo URL is rejected (UI-05); this instance already had a valid logo saved.

## Notes

- The failing tests are deliberate: they are the known defects, written as tests so the failure is visible and the same test confirms the fix later.
- To get a green run while the defects exist, set `EXPECT_DEFECTS=1` (Playwright then marks them as expected failures).
- The setup step (admin login) is counted in the run and passes.
