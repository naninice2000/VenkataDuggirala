# Portfolio Test Automation

This directory contains the automated browser tests for the portfolio website.
The framework uses Python, pytest, and Playwright with headless Chromium.

## Framework structure

```text
tests/
├── README.md          # Framework documentation and test plan
├── conftest.py        # Web server, browser, page, and API-mocking fixtures
└── test_portfolio.py  # Portfolio browser tests
```

Supporting configuration is stored at the project root:

- `pytest.ini` configures test discovery and pytest output.
- `requirements-test.txt` lists the Python test dependencies.
- `.gitignore` excludes virtual environments, caches, and generated reports.

## How the framework works

Before the tests run, `conftest.py` starts a temporary local HTTP server on an
available port and serves the project root. It launches a headless Chromium
browser and opens the portfolio page for each test.

Requests to GitHub and Google Apps Script are mocked. This makes the suite
repeatable, allows it to run without depending on those services, and prevents
tests from creating real endorsements or contact submissions.

The browser and server are closed automatically after the test session.

## Setup

From the project root, create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install pytest, Playwright, and the Chromium browser:

```bash
python3 -m pip install -r requirements-test.txt
python3 -m playwright install chromium
```

## Running the tests

Run the complete suite from the project root:

```bash
python3 -m pytest
```

Run only the portfolio test module:

```bash
python3 -m pytest tests/test_portfolio.py
```

Run one test by name:

```bash
python3 -m pytest tests/test_portfolio.py::test_navigation_matches_section_order
```

Use verbose output when investigating a failure:

```bash
python3 -m pytest -v
```

## Basic test plan

| Area | Validation | Expected result |
| --- | --- | --- |
| Page identity | Open the homepage and inspect its browser title. | The professional portfolio title is displayed. |
| Section structure | Read the top-level section IDs in document order. | About, Impact, Resume, Publications, Certifications, Endorsements, and Contact appear in the approved recruiter-focused order. |
| Navigation | Inspect navigation labels and anchor destinations. | Every menu item has the expected label and points to the matching section. |
| Static assets | Request the custom CSS, JavaScript, profile image, publication image, and résumé. | Every asset returns a successful HTTP response from its organized `assets/` path. |
| Résumé actions | Inspect all résumé download and view links. | All three actions reference `assets/documents/resume.pdf`. |
| Book preview | Open the publication preview and press Escape. | The modal opens, displays its content, and closes correctly. |
| Certificates | Return mocked certificate data, open a certificate, and close its modal. | Certificate cards load and the selected PDF title and download path are correct. |
| Contact form | Complete and submit the form against the mocked API. | The form is hidden and the success message is shown without making a real submission. |

## Current scope

The suite focuses on critical smoke and functional behavior. It does not
currently validate pixel-perfect visual appearance, every responsive viewport,
accessibility rules, live third-party API availability, or real form delivery.
Those can be added as separate test layers when needed.

## Adding a test

Add new browser scenarios to `test_portfolio.py`. Reuse the `page` fixture so
the test receives an isolated browser context with the site already loaded and
external APIs mocked. Keep each test focused on one behavior and use accessible
Playwright locators, such as roles and labels, whenever possible.
