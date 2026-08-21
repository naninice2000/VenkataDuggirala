from playwright.sync_api import Page, expect


def test_page_has_expected_title_and_sections_in_recruiter_order(page: Page) -> None:
    expect(page).to_have_title("Venkata Duggirala | Professional Profile & Portfolio")

    section_ids = page.locator("body > section").evaluate_all(
        "sections => sections.map(section => section.id).filter(Boolean)"
    )
    assert section_ids == [
        "about",
        "achievements",
        "resume",
        "publications",
        "certifications",
        "testimonials",
        "contact",
    ]
    expect(page.get_by_role("heading", name="Career Impact", exact=True)).to_be_visible()


def test_navigation_matches_section_order(page: Page) -> None:
    navigation = page.locator("nav")
    labels = navigation.get_by_role("link").all_inner_texts()
    targets = navigation.get_by_role("link").evaluate_all(
        "links => links.map(link => link.getAttribute('href'))"
    )

    assert labels == [
        "About",
        "Impact",
        "Resume",
        "Publications",
        "Certifications",
        "Endorsements",
        "Contact Me",
    ]
    assert targets == [
        "#about",
        "#achievements",
        "#resume",
        "#publications",
        "#certifications",
        "#testimonials",
        "#contact",
    ]


def test_local_assets_are_available(page: Page, base_url: str) -> None:
    asset_paths = [
        "assets/css/styles.css",
        "assets/js/main.js",
        "assets/images/profile.jpg",
        "assets/images/publications/EstatePlanningForFamiliesInTheUS.jpg",
        "assets/documents/resume.pdf",
    ]

    for asset_path in asset_paths:
        response = page.request.get(f"{base_url}/{asset_path}")
        assert response.ok, f"{asset_path} returned HTTP {response.status}"


def test_resume_actions_reference_the_relocated_pdf(page: Page) -> None:
    resume_links = page.locator('a[href="assets/documents/resume.pdf"]')
    assert resume_links.count() == 3


def test_book_preview_opens_and_closes(page: Page) -> None:
    modal = page.locator("#bookPreviewModal")
    expect(modal).to_be_hidden()

    page.locator(".open-book-preview").last.click()
    expect(modal).to_be_visible()
    expect(page.get_by_role("heading", name="Interactive Sample Coming Soon")).to_be_visible()

    page.keyboard.press("Escape")
    expect(modal).to_be_hidden()


def test_certificates_load_and_open_in_modal(page: Page) -> None:
    certificate = page.get_by_role("heading", name="JavaScript Language", exact=True)
    expect(certificate).to_be_visible()

    preview = page.locator('iframe[title="JavaScript Language first-page preview"]')
    expect(preview).to_have_attribute(
        "src",
        "assets/documents/certificates/JavaScript%20Language.pdf#page=1&toolbar=0&navpanes=0&scrollbar=0",
    )
    certificate.click()

    modal = page.locator("#certModal")
    expect(modal).to_be_visible()
    expect(page.locator("#modalCertTitle")).to_have_text("JavaScript Language")
    expect(page.locator("#modalCertDownload")).to_have_attribute(
        "href", "assets/documents/certificates/JavaScript Language.pdf"
    )

    page.locator("#closeCertButton").click()
    expect(modal).to_be_hidden()


def test_contact_form_displays_success_state(page: Page) -> None:
    page.locator("#contactName").fill("Recruiter Name")
    page.locator("#contactEmail").fill("recruiter@example.com")
    page.locator("#contactCompany").fill("Example Company")
    page.locator("#contactMessage").fill("I would like to discuss an opportunity.")
    page.locator("#contactSubmitBtn").click()

    expect(page.locator("#contactSuccessMsg")).to_be_visible()
    expect(page.locator("#contactForm")).to_be_hidden()
