# Bug report

Found while testing the Restful Booker Platform (local build, v2.2) as a guest and as an admin. All defects were found and can be reproduced in the browser.

The severity of the impact decides the level of priority to assign: **High** = a guest or admin hits a broken journey, or personal data is exposed; **Medium** = wrong behaviour with a workaround or limited reach; **Low** = unclear or untidy behaviour.

| ID | Severity | Title |
|---|---|---|
| UI-01 | High | Booking dates that are already taken crash the page |
| UI-02 | High | Room page crashes for an unknown, non-numeric or deleted room |
| UI-03 | High | The public site lists at most three rooms, so rooms added by admin are usually hidden |
| UI-04 | Medium | Past, reversed and invalid dates are accepted and produce negative or NaN totals |
| UI-05 | Medium | Branding cannot be saved as shipped |
| UI-06 | Medium | Room delete has no confirmation and breaks the guest page when bookings exist |
| UI-07 | Low | Validation messages in the admin room form and the guest booking form are vague and badly formatted |
| UI-08 | Medium | The "new booking" message sent to the admin does not say which room was booked |
| UI-09 | Low | Branding changes take up to a minute to show on the public site |
| UI-10 | Medium | The admin page lets you create a second room with an existing room number |

All steps assume the app is running at http://localhost:3003.

---

## UI defects

### UI-01 (High): Booking dates that are already taken crash the page

**Steps**
1. Open `http://localhost:3003/reservation/3?checkin=2028-03-10&checkout=2028-03-12`.
2. Click **Reserve Now**, fill in first name, last name, email and phone, click **Reserve Now**. The booking is confirmed.
3. Open the same URL again and book it a second time with different guest details.

**Actual:** the page is replaced by "This page couldn't load. Reload to try again, or go back." The browser console shows an uncaught `TypeError` (`Cannot read properties of undefined (reading 'length')`) and the booking API has returned 409.
**Expected:** a message such as "These dates are no longer available", with the form still usable so the guest can pick other dates.
**Impact:** two guests competing for the same room is a normal situation; the loser sees a broken page and cannot tell what happened.

### UI-02 (High): Room page crashes for an unknown, non-numeric or deleted room

**Steps:** open each of these:
- `http://localhost:3003/reservation/9999?checkin=2027-01-01&checkout=2027-01-03`
- `http://localhost:3003/reservation/abc`
- the reservation URL of a room an admin has just deleted (see UI-06)

**Actual:** "This page couldn't load. Reload to try again, or go back." with a console `TypeError` (`reading 'map'`). The page returns HTTP 200.
**Expected:** a not-found message with a link back to the rooms. A missing page should be a 404.

### UI-03 (High): The public site lists at most three rooms, so rooms added by admin are usually hidden

**Steps**
1. Log in at `/admin` with `admin` / `password`.
2. On **Rooms**, create a room (for example name `QA1`, price `80`, tick TV) and click **Create**. It shows in the admin table.
3. Open the home page and look at **Our Rooms**.

**Actual:** only three rooms are shown (Single, Double, Suite). The new room is not listed, so guests cannot find or book it. The API returns every room (`GET /api/room`), so the data is there. The cause is in `assets/src/components/home/Availability.tsx:102`: `rooms.slice(0, 3)`. The new room only appears when enough earlier rooms are already booked for the dates searched: with rooms 1 and 2 booked for a date range, a search for those dates returned rooms 3, 4 and 6, so room 6 then shows. That is why a new room can look fine when other rooms are booked and be invisible otherwise.
**Expected:** every available room is shown (or the limit is a deliberate, visible feature such as paging or a "show more" link).
**Impact:** the admin cannot reliably add sellable rooms, and which rooms guests see depends on what else is booked.

### UI-04 (Medium): Past, reversed and invalid dates are accepted and give negative or NaN totals

**Steps**
1. On the home page set **Check In** to `01/01/2020` and **Check Out** to `03/01/2020`, click **Check Availability**. All three rooms are offered.
2. Set **Check In** `12/12/2027` and **Check Out** `10/12/2027` (before check-in), click **Check Availability**. All rooms are still offered, and the links carry `checkin=2027-12-12&checkout=2027-12-10`.
3. Open `http://localhost:3003/reservation/1?checkin=2027-01-05&checkout=2027-01-01`.
4. Open `http://localhost:3003/reservation/1?checkin=garbage&checkout=garbage`.

**Actual:** step 3 shows "£100 x -4 nights, £-400"; step 4 shows "£100 x NaN nights, £NaN". Past dates give a normal price (2 nights, £200).
**Expected:** the date pickers should not allow past dates or a check-out on or before check-in; the room page should reject invalid dates before showing a price.

### UI-05 (Medium): Branding cannot be saved as shipped

**Steps**
1. Log in, open **Branding**.
2. Change only the **Name** (or change nothing) and click **Submit**.

**Note:** this happens on a freshly started instance. If a valid logo URL has already been saved, later saves work.

**Actual:** "Url should be a correct url format". The seeded **Logo** value is `/images/rbp-logo.jpg`, which the form's own validation rejects, so no change can be saved until the logo is replaced with an absolute URL (for example `http://localhost:3003/images/rbp-logo.jpg`); after that the save works and shows a success message.
**Expected:** the seeded value passes validation, or the validation accepts relative paths, or the error names the Logo field.
**Impact:** an admin changing a phone number or address is blocked by an unrelated, unlabelled field.

### UI-06 (Medium): Room delete has no confirmation and breaks the guest page when bookings exist

**Steps**
1. Create a room in admin and make a booking for it (use the room's reservation page).
2. On **Rooms**, click the delete (x) icon on that room's row.
3. Open the room's reservation URL.

**Actual:** the room disappears immediately with no confirmation and no warning that it has bookings. The room's reservation page then crashes (UI-02).
**Expected:** a confirmation step that mentions existing bookings, and either blocking the delete or handling the bookings; a deleted room should be a clean "not found".

### UI-07 (Low): Validation messages in the admin room form and the guest booking form are vague and badly formatted

**Steps**
1. Guest booking form: open `http://localhost:3003/reservation/1?checkin=2033-05-10&checkout=2033-05-12`, click **Reserve Now** to show the guest form, then click **Reserve Now** again with the form empty. Then try first name `Jo`, last name `Li`, email `nope`, phone `123`.
2. Admin room form: on **Rooms**, click **Create** with the form empty; then try price `99.99`, `abc`, `-5`, `100000`; then edit a room, set the price to `0` and click **Update**.

**Actual (guest booking form)**
- All the errors appear together in one box, in an order that does not match the form, for example: "Lastname should not be blank / size must be between 3 and 18 / size must be between 3 and 30 / size must be between 11 and 21 / must not be empty / Firstname should not be blank / must not be empty".
- Some messages name the field ("Lastname should not be blank") but most do not: "size must be between 3 and 18", "size must be between 3 and 30" and "size must be between 11 and 21" do not say which field they are about, and "must not be empty" appears twice with no field.
- No input is highlighted, and the form has placeholders but no labels, so a guest cannot tell which field each message is about.
- For the short values, the message "size must be between 3 and 18" is the first name rule, "3 and 30" is the last name rule and "11 and 21" is the phone rule, but nothing says so.

**Actual (admin room form)**
- Empty form, `99.99` and `abc` all show only "Failed to create room".
- `-5` shows "must be greater than or equal to 1" and `100000` shows "must be less than or equal to 999" (no field name).
- Editing the price to `0` shows "Failed to update room".

**Expected:** each message names the field and the rule, is shown next to its field or in the same order as the form, and the invalid field is highlighted. For example "First name must be between 3 and 18 characters", "Phone must be between 11 and 21 characters", "Room name must be set", "Price must be a whole number between 1 and 999". The contact form already does this well ("Subject must be between 5 and 100 characters"), so the booking and room forms should match it.

### UI-08 (Medium): The "new booking" message sent to the admin does not say which room was booked

**Steps**
1. As a guest, book any room (for example `http://localhost:3003/reservation/1?checkin=2032-05-10&checkout=2032-05-12`).
2. Log in as admin and open **Messages**. A message "You have a new booking!" has arrived (unread count goes up).
3. Open the message.

**Actual:** the body reads "You have a new booking from {guest}. They have booked a room for the following dates: 2032-05-10 to 2032-05-12", with the guest's email and phone. It does not say which room (number, type or price). The cause is `booking/src/main/java/com/automationintesting/service/MessageBuilder.java`, which builds the text from the guest and dates only.
**Expected:** the message names the room (for example "Room 101, Single"), so the admin can act on it without searching the report.
**Impact:** with several rooms and bookings, the admin has to cross-check the Report page to find out what was booked.

### UI-09 (Low): Branding changes take up to a minute to show on the public site

**Steps**
1. Log in, open **Branding**, change the **Name**, and save (see UI-05 for a save that works).
2. Open the home page in another browser or private window, and reload every few seconds.

**Actual:** the old name is shown for up to about a minute. `GET /api/branding` returns the old value while the branding service itself already has the new one. `assets/src/app/api/branding/route.ts` fetches with `revalidate: 60` and the `PUT` handler never clears that cache; the admin form also loads branding with `cache: 'force-cache'` (`Branding.tsx:35`), so it can show old values too.
**Expected:** a saved change is visible straight away (clear the cached branding when the `PUT` succeeds).

### UI-10 (Medium): The admin page lets you create a second room with an existing room number

**Steps**
1. Log in, open **Rooms**, and note an existing room number (for example `101`).
2. In the create form enter the same room number (`101`), a price (for example `90`), and click **Create**.
3. Repeat if you like: every click adds another room.

**Actual:** no error. A second room `101` appears in the table, and both show up in `GET /api/room`. The room list now has two rows with the same number, with different prices if you chose a different one, and nothing tells staff which is the real one. Running the Java e2e suite that `build_locally.cmd` starts also leaves duplicates (two `103` rooms on my instance).
**Expected:** the form rejects a room number that already exists, with a message such as "Room number 101 already exists".
**Impact:** room numbers are how staff and the report identify a room (the report shows "Name - Room: 103"), so duplicates make bookings ambiguous.


---

## Checked, not a defect

- The Next.js development overlay and "stale version" notice appear because the app runs in dev mode.
- A second booking for dates that are already taken is refused by the system (UI-01 covers how the page shows it).
- Script and markup typed into the contact form, booking names and room names are shown as text and do not run.
