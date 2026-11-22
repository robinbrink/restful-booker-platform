# restful-booker-platform

> ## For the assessor: QA UI test assignment
>
> This copy of the platform includes my test work in the [`playwright-tests/`](playwright-tests/) folder. Everything else is the original platform, unchanged.
>
> | What you asked for | Where it is |
> |---|---|
> | Code (runnable from a clean start) | [`playwright-tests/`](playwright-tests/) plus the platform in this repository |
> | Test scenarios and why they were prioritised | [`playwright-tests/TEST_PLAN.md`](playwright-tests/TEST_PLAN.md) (risk assessment, positive and negative scenarios, automated and manual cases, non-functional tests to consider) |
> | Bug report | [`playwright-tests/BUGS.md`](playwright-tests/BUGS.md) (10 defects, all reproducible in the browser, with steps, actual and expected results) |
> | Setup, run instructions, assumptions, limitations | [`playwright-tests/README.md`](playwright-tests/README.md) |
> | Latest run results | [`playwright-tests/TEST_RESULTS.md`](playwright-tests/TEST_RESULTS.md) |
>
> ### Quick start
>
> **Prerequisites:** JDK 26, Maven 3.9.14, Node and npm (see Requirements below). I ran it on Windows 11 with Node 26.
>
> 1. **Start the platform.** In a terminal at the repository root run `build_locally.cmd` (Windows) or `bash build_locally.sh` (Mac/Linux). The first build downloads dependencies and takes several minutes. Leave this terminal open: pressing Enter in it stops the application.
> 2. **Check the site.** Open http://localhost:3003. If it does not load (the Java services can be up while the front end is not), open a second terminal, run `cd assets` then `npm run dev`, and try again.
> 3. **Run the tests.** In another terminal:
>    ```
>    cd playwright-tests
>    npm install
>    npx playwright install chromium
>    npm test
>    ```
>    This takes about 2 minutes. `npm run test:smoke` runs a 10-second smoke pack.
> 4. **Read the result.** `npm run report` opens the HTML report, and `npm run report:summary` rewrites `TEST_RESULTS.md`.
>
> **What a good run looks like:** 33 tests "passed": 20 are normal passes, and 13 are tests for known defects that assert the *correct* behaviour and are marked as expected failures, so they show as `x`. Each names its bug id (for example UI-01). They turn red when the defect is fixed. See `playwright-tests/README.md` for how to show the real failure behind each one.
>
> Note: `build_locally.cmd` finishes by running the platform's own Java end-to-end suite, which adds a few extra rooms and messages. The services use in-memory databases, so restarting them restores the original data.

---

A platform of web services that forms a Bed and Breakfast booking system. The platforms primary purpose is for  training others on how to explore and test web service platforms as well as strategise and implement automation in testing strategies.

## Requirements
RBP is currently known to work with the following requirements:

- JDK 26 or higher (Tested with JDK 26)
- Maven 3.9.14
- Node 24.14.1
- NPM 11.11.0

## Building locally

Assuming you have the above requirements in place, to get started open a terminal/command line window and follow these instructions:

1. Clone/Download the repository
2. Navigate into the restful-booker-platform root folder
3. Run either ```bash build_locally.sh``` for Linux or Mac or ```build_locally.cmd``` on Windows to build RBP and get it running (It may take a while on the first run as it downloads dependencies)
4. Navigate to http://localhost:3003 to access the site

## Running locally

Assuming you have successfully built the application at least once, you can now run the app without having to rebuild the whole application.

### Mac / Linux
1. To run without end-to-end checks run: ```run_locally.sh```
2. To run with end-to-end checks run: ```run_locally.sh -e true```

### Windows
1. To run without end-to-end checks run: ```run_locally.cmd```
2. To run with end-to-end checks run: ```run_locally.cmd true```

### Login
The user login details are:
* Username: admin
* Password: password

## Development

### API details

The details on running checks, building APIs and additional details on documentation for development can be found in READMEs inside each of the API folders.
