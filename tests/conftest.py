from __future__ import annotations

import contextlib
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page, Playwright, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]


class QuietStaticFileHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        pass


@pytest.fixture(scope="session")
def base_url() -> str:
    handler = lambda *args, **kwargs: QuietStaticFileHandler(  # noqa: E731
        *args, directory=str(PROJECT_ROOT), **kwargs
    )
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    with sync_playwright() as instance:
        yield instance


@pytest.fixture(scope="session")
def browser(playwright_instance: Playwright) -> Browser:
    browser_instance = playwright_instance.chromium.launch(headless=True)
    yield browser_instance
    browser_instance.close()


@pytest.fixture
def page(browser: Browser, base_url: str) -> Page:
    context = browser.new_context()
    page = context.new_page()

    page.route(
        "https://api.github.com/**",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=(
                '[{"name":"JavaScript Language.pdf"},'
                '{"name":"PythonFundamentals_Certificate.pdf"}]'
            ),
        ),
    )
    page.route(
        "https://script.google.com/**",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body="[]",
        ),
    )

    page.goto(base_url, wait_until="domcontentloaded")
    yield page

    with contextlib.suppress(Exception):
        context.close()
