# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin\rooms.spec.js >> Admin rooms >> AT-23 a room number that already exists cannot be created again @known-defect
- Location: tests\admin\rooms.spec.js:73:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.alert').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.alert').first() with timeout 10000ms
  - waiting for locator('.alert').first()

```

```yaml
- navigation:
  - link "Restful Booker Platform Demo":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /admin/rooms
    - listitem:
      - link "Report":
        - /url: /admin/report
    - listitem:
      - link "Branding":
        - /url: /admin/branding
    - listitem:
      - link "Messages 1":
        - /url: /admin/message
  - list:
    - listitem:
      - link "Front Page":
        - /url: /
    - listitem:
      - button "Logout"
- paragraph: "Room #"
- paragraph: Type
- paragraph: Accessible
- paragraph: Price
- paragraph: Room details
- paragraph: "101"
- paragraph: Single
- paragraph: "true"
- paragraph: "100"
- paragraph: TV, WiFi, Safe
- text: 
- paragraph: "102"
- paragraph: Double
- paragraph: "true"
- paragraph: "150"
- paragraph: TV, Radio, Safe
- text: 
- paragraph: "103"
- paragraph: Suite
- paragraph: "true"
- paragraph: "225"
- paragraph: Radio, WiFi, Safe
- text: 
- paragraph: "104"
- paragraph: Family
- paragraph: "true"
- paragraph: "200"
- paragraph: WiFi, TV, Radio, Safe
- text: 
- paragraph: "103"
- paragraph: Suite
- paragraph: "true"
- paragraph: "225"
- paragraph: WiFi, Radio, Safe
- text: 
- paragraph: AutoTfnwb5t
- paragraph: Single
- paragraph: "false"
- paragraph: "80"
- paragraph: WiFi
- text: 
- paragraph: AutoTfnwb5t
- paragraph: Single
- paragraph: "false"
- paragraph: "90"
- paragraph: WiFi
- text: 
- textbox
- combobox:
  - option "Single" [selected]
  - option "Twin"
  - option "Double"
  - option "Family"
  - option "Suite"
- combobox:
  - option "false" [selected]
  - option "true"
- textbox
- checkbox "WiFi"
- text: WiFi
- checkbox "TV"
- text: TV
- checkbox "Radio"
- text: Radio
- checkbox "Refreshments"
- text: Refreshments
- checkbox "Safe"
- text: Safe
- checkbox "Views"
- text: Views
- button "Create"
- alert
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const { knownDefect } = require('../support/known');
  3   | const { AdminRoomsPage, HomePage } = require('../support/pages');
  4   | const { tag, futureRange } = require('../support/data');
  5   | const { adminToken, createRoom, createBooking, getRooms, cleanup } = require('../support/api');
  6   | 
  7   | test.describe('Admin rooms', () => {
  8   |   let t;
  9   |   let roomName;
  10  |   test.beforeEach(() => { t = tag(); roomName = `Auto${t}`; });
  11  |   test.afterEach(async ({ request }) => { await cleanup(request, t, { roomNames: [roomName] }); });
  12  | 
  13  |   // UI-03: only the first three rooms are shown on the public site
  14  |   test('AT-12 a room created by admin is listed in admin and on the public site @known-defect', async ({ page, request }) => {
  15  |     knownDefect(test, 'UI-03: the home page shows only the first three rooms (rooms.slice(0, 3))');
  16  |     const rooms = new AdminRoomsPage(page);
  17  |     await rooms.goto();
  18  |     await rooms.create({ name: roomName, price: 80 });
  19  |     await expect(rooms.row(roomName)).toBeVisible(); // admin side works
  20  | 
  21  |     const total = (await getRooms(request)).length;
  22  |     const home = new HomePage(page);
  23  |     await home.goto();
  24  |     await expect(home.bookLinks).toHaveCount(total); // public side should list every room
  25  |   });
  26  | 
  27  |   test('AT-13 editing a room price and description persists', async ({ page, request }) => {
  28  |     const token = await adminToken(request);
  29  |     expect((await createRoom(request, token, { roomName, roomPrice: 80 })).ok()).toBe(true);
  30  | 
  31  |     const rooms = new AdminRoomsPage(page);
  32  |     await rooms.goto();
  33  |     await rooms.row(roomName).click();
  34  |     await page.getByRole('button', { name: 'Edit' }).first().click();
  35  |     await page.locator('.room-details #roomPrice').fill('120');
  36  |     await page.locator('.room-details #description').fill('An updated description written by the automated test.');
  37  |     await page.locator('#update').click();
  38  |     await expect(page.locator('.room-details')).toContainText('Room price: 120');
  39  | 
  40  |     const saved = (await getRooms(request)).find((r) => r.roomName === roomName);
  41  |     expect(saved.roomPrice).toBe(120);
  42  |     expect(saved.description).toContain('updated description');
  43  |   });
  44  | 
  45  |   // UI-07: vague admin errors
  46  |   test('AT-14a empty room form says what is missing @known-defect', async ({ page }) => {
  47  |     knownDefect(test, 'UI-07: the only message is "Failed to create room"');
  48  |     const rooms = new AdminRoomsPage(page);
  49  |     await rooms.goto();
  50  |     await rooms.createButton.click();
  51  |     await expect(rooms.alerts.first()).toContainText(/name/i);
  52  |   });
  53  | 
  54  |   test('AT-14b a decimal price says what is wrong @known-defect', async ({ page }) => {
  55  |     knownDefect(test, 'UI-07: the only message is "Failed to create room"');
  56  |     const rooms = new AdminRoomsPage(page);
  57  |     await rooms.goto();
  58  |     await rooms.create({ name: roomName, price: '99.99' });
  59  |     await expect(rooms.alerts.first()).toContainText(/price/i);
  60  |   });
  61  | 
  62  |   test('AT-14c price outside 1 to 999 is rejected', async ({ page }) => {
  63  |     const rooms = new AdminRoomsPage(page);
  64  |     await rooms.goto();
  65  |     await rooms.create({ name: roomName, price: '-5' });
  66  |     await expect(rooms.alerts.first()).toContainText('greater than or equal to 1');
  67  |     await rooms.create({ name: roomName, price: '100000' });
  68  |     await expect(rooms.alerts.first()).toContainText('less than or equal to 999');
  69  |     await expect(rooms.row(roomName)).toHaveCount(0);
  70  |   });
  71  | 
  72  |   // UI-10: the admin form lets you create a second room with an existing room number
  73  |   test('AT-23 a room number that already exists cannot be created again @known-defect', async ({ page, request }) => {
  74  |     knownDefect(test, 'UI-10: the duplicate room is created with no error');
  75  |     const token = await adminToken(request);
  76  |     expect((await createRoom(request, token, { roomName })).ok()).toBe(true);
  77  | 
  78  |     const rooms = new AdminRoomsPage(page);
  79  |     await rooms.goto();
  80  |     await expect(rooms.row(roomName)).toHaveCount(1);
  81  |     await rooms.create({ name: roomName, price: 90 });
  82  | 
> 83  |     await expect(rooms.alerts.first()).toBeVisible();
      |                                        ^ Error: expect(locator).toBeVisible() failed
  84  |     const sameName = (await getRooms(request)).filter((r) => r.roomName === roomName);
  85  |     expect(sameName).toHaveLength(1);
  86  |   });
  87  | 
  88  |   // UI-06: delete has no confirmation and orphans bookings
  89  |   test('AT-15 deleting a room that has a booking asks for confirmation @known-defect', async ({ page, request }) => {
  90  |     knownDefect(test, 'UI-06: the room is deleted immediately, with no confirmation or warning');
  91  |     const token = await adminToken(request);
  92  |     expect((await createRoom(request, token, { roomName })).ok()).toBe(true);
  93  |     const room = (await getRooms(request)).find((r) => r.roomName === roomName);
  94  |     const { checkin, checkout } = futureRange(2);
  95  |     expect((await createBooking(request, { roomid: room.roomid, checkin, checkout, lastname: t })).status()).toBe(201);
  96  | 
  97  |     let dialogSeen = false;
  98  |     page.on('dialog', (d) => { dialogSeen = true; d.dismiss(); });
  99  |     const rooms = new AdminRoomsPage(page);
  100 |     await rooms.goto();
  101 |     await page.locator(`span.roomDelete[id="${room.roomid}"]`).click();
  102 | 
  103 |     const inPageConfirm = await page.getByText(/are you sure|confirm|has bookings/i).isVisible().catch(() => false);
  104 |     expect(dialogSeen || inPageConfirm).toBe(true);
  105 |     await expect(rooms.row(roomName)).toBeVisible(); // still there until the admin confirms
  106 |   });
  107 | });
  108 | 
```