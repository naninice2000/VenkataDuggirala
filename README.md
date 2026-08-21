# Venkata Duggirala Portfolio

A static personal portfolio built with HTML, Tailwind CSS, and vanilla JavaScript.

## Project structure

```text
.
├── index.html
└── assets
    ├── css
    │   └── styles.css
    ├── documents
    │   ├── resume.pdf
    │   └── certificates
    ├── images
    │   ├── profile.jpg
    │   └── publications
    └── js
        └── main.js
```

## Run locally

From the project root, run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Run automated tests

Create and activate a virtual environment, then install the test dependencies and
the Chromium browser used by Playwright:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements-test.txt
python3 -m playwright install chromium
```

Run the complete suite from the project root:

```bash
python3 -m pytest
```

The tests start their own temporary local HTTP server. The external certificate
and form APIs are mocked, so test runs do not create real reviews or contact
submissions.
