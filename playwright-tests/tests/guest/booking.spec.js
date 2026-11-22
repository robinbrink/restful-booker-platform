const { test, expect } = require('@playwright/test');
const { knownDefect } = require('../support/known');
const { HomePage, ReservationPage } = require('../support/pages');
const { tag, futureRange, guest } = require('../support/data');
const { createBooking, cleanup } = require('../support/api');

const ROOM = 1; // Single, £100 per night

test.describe('Guest booking', () => {
  let t;
  test.beforeEach(() => { t = tag(); });
  test.afterEach(async ({ request }) => { await cleanup(request, t); });

  test('AT-02 guest searches, books a room and sees the confirmation @smoke', async ({ page }) => {
    const { checkin, checkout } = futureRange(2);
    const home = new HomePage(page);
    await home.goto();
    await home.search(checkin, checkout);

    await expect(home.bookLinks.first()).toHaveAttribute('href', new RegExp(`checkin=${checkin}&checkout=${checkout}`));
    await home.bookLinks.first().click();
    await expect(page).toHaveURL(/\/reservation\/1\?/);

    const reservation = new ReservationPage(page);
    await reservation.reserve(guest(t));

    await expect(page.getByText('Booking Confirmed')).toBeVisible();
    await expect(page.getByText(`${checkin} - ${checkout}`)).toBeVisible();
  });

  test('AT-03 price summary adds nights, cleaning fee and service fee', async ({ page }) => {
    const { checkin, checkout } = futureRange(3);
    const reservation = new ReservationPage(page);
    await reservation.goto(ROOM, checkin, checkout);

    await expect(page.getByText('£100 x 3 nights')).toBeVisible();
    await expect(page.getByText('£300', { exact: true })).toBeVisible();
    await expect(page.getByText('£25', { exact: true })).toBeVisible();
    await expect(page.getByText('£15', { exact: true })).toBeVisible();
    await expect(page.getByText('£340', { exact: true })).toBeVisible(); // 300 + 25 + 15
  });

  test('AT-04 empty guest form shows a message for every field', async ({ page }) => {
    const { checkin, checkout } = futureRange(2);
    const reservation = new ReservationPage(page);
    await reservation.goto(ROOM, checkin, checkout);
    await reservation.openGuestForm();
    await reservation.submit();

    // The form is not submitted and errors are shown (their wording is checked in AT-04b)
    await expect(page.locator('.alert')).toBeVisible();
    await expect(page.locator('.alert')).toContainText(/Firstname should not be blank/i);
    await expect(page.getByText('Booking Confirmed')).toHaveCount(0);
  });

  // UI-07: messages are unlabelled, in one box, in a different order to the form
  test('AT-04b every guest form message names the field it is about @known-defect', async ({ page }) => {
    knownDefect(test, 'UI-07: messages such as "size must be between 11 and 21" and "must not be empty" do not name their field');
    const { checkin, checkout } = futureRange(2);
    const reservation = new ReservationPage(page);
    await reservation.goto(ROOM, checkin, checkout);
    await reservation.openGuestForm();
    await reservation.submit();

    const text = await page.locator('.alert').innerText();
    for (const field of [/first ?name/i, /last ?name/i, /email/i, /phone/i]) {
      expect(text, `an error message should mention ${field}`).toMatch(field);
    }
  });

  // UI-01: a second booking for taken dates crashes the page
  test('AT-05 booking dates that are already taken shows a clear message @known-defect', async ({ page, request }) => {
    knownDefect(test, 'UI-01: the page crashes ("This page couldn\'t load") instead of showing a message');
    const { checkin, checkout } = futureRange(2);
    const first = await createBooking(request, { roomid: ROOM, checkin, checkout, lastname: t });
    expect(first.status()).toBe(201);

    const reservation = new ReservationPage(page);
    await reservation.goto(ROOM, checkin, checkout);
    const bookingResponse = page.waitForResponse((r) => r.url().includes('/api/booking') && r.request().method() === 'POST');
    await reservation.reserve(guest(t));
    expect((await bookingResponse).status()).toBe(409); // the API correctly refuses the second booking

    await expect(page.getByText(/not available|unavailable|already booked|no longer available/i)).toBeVisible();
    await expect(reservation.crashMessage).toHaveCount(0);
  });
});

test.describe('Guest error handling', () => {
  // UI-02: unknown and non-numeric room ids crash the page
  for (const path of ['/reservation/9999?checkin=2032-01-01&checkout=2032-01-03', '/reservation/abc']) {
    test(`AT-06 ${path} shows a not-found message @known-defect`, async ({ page }) => {
      knownDefect(test, 'UI-02: the page crashes instead of showing a not-found message');
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/not found|does not exist|no longer exists/i)).toBeVisible();
      await expect(page.getByText(/couldn.t load/i)).toHaveCount(0);
    });
  }
});
