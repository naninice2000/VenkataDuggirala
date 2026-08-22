// Endorsement Reviews API Endpoint
const REVIEWS_API_URL = "https://script.google.com/macros/s/AKfycbyCltgVPJO7PqrCHMZrjeSBJOTCJ-Mp2-Zffoy9km9WTb_l4IzqCvl7pWzuynhzkFrD/exec";

// Dedicated Contact Form API Endpoint
const CONTACT_API_URL = "https://script.google.com/macros/s/AKfycbxLBHQYaWtQ88BYXUEnhhkvqLtY2LIExeZ64Hay-g2nUlPDJ6VgvUiKyS-UOyEqdnk/exec";

// Mobile navigation
const mobileMenuButton = document.getElementById('mobileMenuButton');
const primaryNavigation = document.getElementById('primaryNavigation');

function closeMobileMenu() {
  primaryNavigation.classList.add('hidden');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
  mobileMenuButton.querySelector('.menu-open-icon').classList.remove('hidden');
  mobileMenuButton.querySelector('.menu-close-icon').classList.add('hidden');
}

mobileMenuButton.addEventListener('click', () => {
  const isOpening = primaryNavigation.classList.contains('hidden');
  primaryNavigation.classList.toggle('hidden');
  mobileMenuButton.setAttribute('aria-expanded', String(isOpening));
  mobileMenuButton.setAttribute('aria-label', isOpening ? 'Close navigation menu' : 'Open navigation menu');
  mobileMenuButton.querySelector('.menu-open-icon').classList.toggle('hidden', isOpening);
  mobileMenuButton.querySelector('.menu-close-icon').classList.toggle('hidden', !isOpening);
});

primaryNavigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) closeMobileMenu();
});

// 1. BOOK PREVIEW MODAL LOGIC
function openBookPreviewModal() {
  document.getElementById('bookPreviewModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeBookPreviewModal() {
  document.getElementById('bookPreviewModal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// 2. DYNAMIC CERTIFICATE LOADER VIA GITHUB API
const GITHUB_USER = "naninice2000";
const GITHUB_REPO = "VenkataDuggirala";
const CERTIFICATES_REPOSITORY_PATH = "assets/documents/certificates";
const CERTIFICATES_PUBLIC_PATH = "assets/documents/certificates";

async function loadCertificates() {
  const grid = document.getElementById('certificationsGrid');
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${CERTIFICATES_REPOSITORY_PATH}`);
    const files = await res.json();

    if (!Array.isArray(files)) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-500 text-sm">Upload PDF files to the certificates directory in your repo.</p>`;
      return;
    }

    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-500 text-sm">No PDF certificates found in the /certificates folder.</p>`;
      return;
    }

    grid.innerHTML = "";
    pdfFiles.forEach(file => {
      const rawTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
      const filePath = `${CERTIFICATES_PUBLIC_PATH}/${file.name}`;

      const card = document.createElement('div');
      card.className = "cursor-pointer group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 flex flex-col justify-between";
      card.addEventListener('click', () => openCertModal(filePath, title));
      card.innerHTML = `
        <div class="relative w-full aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            class="w-full h-full pointer-events-none bg-white"
            src="${encodeURI(filePath)}#page=1&toolbar=0&navpanes=0&scrollbar=0"
            title="${escapeHtml(title)} first-page preview"
            loading="lazy"
            tabindex="-1">
          </iframe>
          <span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-wider text-blue-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase shadow-sm">VIEW PDF</span>
        </div>
        <div class="mt-4 text-center">
          <h3 class="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition capitalize">${escapeHtml(title)}</h3>
          <p class="text-xs text-slate-500 mt-1">Official Document</p>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Error loading certificates:", e);
    grid.innerHTML = `<p class="col-span-full text-center text-slate-500 text-sm">Failed to load certificates.</p>`;
  }
}

function openCertModal(pdfPath, title) {
  document.getElementById('modalCertTitle').innerText = title;
  document.getElementById('modalCertDownload').href = pdfPath;
  document.getElementById('modalPdfFrame').src = pdfPath;
  document.getElementById('certModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCertModal() {
  document.getElementById('certModal').classList.add('hidden');
  document.getElementById('modalPdfFrame').src = "";
  document.body.style.overflow = 'auto';
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertModal();
    closeBookPreviewModal();
  }
});

// 3. ENDORSEMENTS SCRIPT
const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');

function renderReview(name, role, text) {
  const card = document.createElement('div');
  card.className = 'bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm';
  card.innerHTML = `
    <p class="text-slate-700 italic">"${escapeHtml(text)}"</p>
    <div class="mt-4 font-semibold text-slate-900 text-sm">— ${escapeHtml(name)} <span class="text-xs font-normal text-slate-500">(${escapeHtml(role)})</span></div>
  `;
  reviewsList.prepend(card);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

async function loadReviews() {
  try {
    const response = await fetch(REVIEWS_API_URL);
    const data = await response.json();
    reviewsList.innerHTML = "";

    if (!data || data.length === 0) {
      reviewsList.innerHTML = `<p class="text-slate-500 text-sm col-span-2 text-center">No endorsements posted yet. Be the first to leave one!</p>`;
    } else {
      data.forEach(item => {
        renderReview(item.name, item.role, item.text);
      });
    }
  } catch (err) {
    console.error("Error loading reviews:", err);
    reviewsList.innerHTML = `<p class="text-slate-500 text-sm col-span-2 text-center">Endorsements will display once posted.</p>`;
  }
}

reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = reviewForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerText = "Submitting...";

  const payload = {
    formType: "review",
    name: document.getElementById('reviewerName').value.trim(),
    role: document.getElementById('reviewerRole').value.trim(),
    text: document.getElementById('reviewerText').value.trim()
  };

  try {
    await fetch(REVIEWS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    renderReview(payload.name, payload.role, payload.text);
    reviewForm.reset();
    submitBtn.innerText = "Posted Successfully!";
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = "Post Review";
    }, 2500);
  } catch (err) {
    alert("Failed to submit endorsement. Please try again.");
    submitBtn.disabled = false;
    submitBtn.innerText = "Post Review";
  }
});

// 4. CONTACT FORM SCRIPT
const contactForm = document.getElementById('contactForm');
const contactSuccessMsg = document.getElementById('contactSuccessMsg');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  contactSubmitBtn.disabled = true;
  contactSubmitBtn.innerText = "Sending Message...";

  const payload = {
    formType: "contact",
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    company: document.getElementById('contactCompany').value.trim(),
    message: document.getElementById('contactMessage').value.trim()
  };

  try {
    await fetch(CONTACT_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    contactForm.reset();
    contactForm.classList.add('hidden');
    contactSuccessMsg.classList.remove('hidden');
  } catch (err) {
    alert("There was an issue sending your message. Please try again.");
    contactSubmitBtn.disabled = false;
    contactSubmitBtn.innerText = "Send Message";
  }
});

// Static UI event handlers
document.querySelectorAll('.open-book-preview').forEach((button) => {
  button.addEventListener('click', openBookPreviewModal);
});

document.getElementById('closeBookPreviewButton').addEventListener('click', closeBookPreviewModal);
document.getElementById('closeBookPreviewFooterButton').addEventListener('click', closeBookPreviewModal);
document.getElementById('closeCertButton').addEventListener('click', closeCertModal);

document.querySelector('.protected-image-overlay').addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

document.getElementById('profilePhoto').addEventListener('error', (event) => {
  event.currentTarget.src = 'https://placehold.co/400x400/e2e8f0/475569?text=Your+Photo';
}, { once: true });

document.getElementById('bookCover').addEventListener('error', (event) => {
  event.currentTarget.src = 'https://placehold.co/400x600/1e293b/ffffff?text=Book+Cover';
}, { once: true });

// Load data-backed content
loadCertificates();
loadReviews();
