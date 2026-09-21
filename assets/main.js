/**
 * WyrexSMP Official Persian RTL Website
 * Vanilla JavaScript (Zero build step, Zero npm, Cloudflare Pages Ready)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCopyButtons();
  initMobileMenu();
  initStoreFilters();
  initOrderModal();
  initFaqAccordion();
  initRulesSearch();
  initTelemetrySimulator();
  initSupportForm();
});

/* ==========================================================================
   TOAST SYSTEM
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   CLIPBOARD & IP COPY
   ========================================================================== */
function initCopyButtons() {
  const copyBtns = document.querySelectorAll('[data-copy-ip]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const ip = btn.getAttribute('data-copy-ip') || 'Wyrex.funserver.top';
      
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(ip).then(() => {
          handleCopySuccess(btn, ip);
        }).catch(() => {
          fallbackCopyTextToClipboard(ip, btn);
        });
      } else {
        fallbackCopyTextToClipboard(ip, btn);
      }
    });
  });
}

function fallbackCopyTextToClipboard(text, btn) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    handleCopySuccess(btn, text);
  } catch (err) {
    showToast('خطا در کپی خودکار، آدرس: ' + text);
  }
  document.body.removeChild(textArea);
}

function handleCopySuccess(btn, ip) {
  const originalText = btn.innerHTML;
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    کپی شد!
  `;
  btn.style.borderColor = '#10B981';
  showToast(`آدرس سرور (${ip}) با موفقیت کپی شد! وارد ماینکرفت شوید.`);

  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.borderColor = '';
  }, 2500);
}

/* ==========================================================================
   MOBILE MENU DRAWER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target) && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
    }
  });
}

/* ==========================================================================
   STORE FILTERS & SEARCH
   ========================================================================== */
function initStoreFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const searchInput = document.getElementById('store-search');

  if (!filterBtns.length && !searchInput) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterItems() {
    productCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = (card.querySelector('.product-title')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('.product-desc')?.textContent || '').toLowerCase();

      const matchesCat = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterItems();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterItems();
    });
  }
}

/* ==========================================================================
   TELEGRAM ORDER MODAL & ORDER WORKFLOW
   ========================================================================== */
let activeOrderProduct = {
  title: 'رنک VIP+',
  usd: '14.99',
  toman: '890,000 تومان',
  img: 'assets/images/rank.jpg'
};

function initOrderModal() {
  const modal = document.getElementById('order-modal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  const cancelBtn = modal.querySelector('#btn-modal-cancel');
  const submitBtn = modal.querySelector('#btn-submit-order');
  const buyBtns = document.querySelectorAll('[data-buy-product]');

  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card') || btn.closest('.featured-card');
      if (card) {
        const title = card.querySelector('.product-title, .featured-title')?.textContent.trim() || 'محصول ماینکرفت';
        const usd = card.querySelector('.product-usd, .price-val')?.textContent.trim() || '';
        const toman = card.querySelector('.product-toman-micro, .price-toman')?.textContent.trim() || '';
        const img = card.querySelector('img')?.getAttribute('src') || 'assets/images/rank.jpg';

        activeOrderProduct = { title, usd, toman, img };
        populateModal(modal, activeOrderProduct);
        modal.classList.add('active');
      }
    });
  });

  const closeModal = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const ignInput = document.getElementById('modal-ign');
      const platformSelect = document.getElementById('modal-platform');
      const notesInput = document.getElementById('modal-notes');

      const ign = ignInput ? ignInput.value.trim() : '';
      const platform = platformSelect ? platformSelect.value : 'Java Edition';
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!ign) {
        showToast('لطفاً نام کاربری (IGN) خود در ماینکرفت را وارد کنید!');
        ignInput?.focus();
        return;
      }

      // Generate formatted Telegram Message for Persian community
      const message = 
        `🎮 درخواست خرید از فروشگاه WyrexSMP\n` +
        `➖➖➖➖➖➖➖➖\n` +
        `📦 نام محصول: ${activeOrderProduct.title}\n` +
        `💰 قیمت: ${activeOrderProduct.toman} (${activeOrderProduct.usd})\n` +
        `👤 نام کاربری در بازی (IGN): ${ign}\n` +
        `💻 پلتفرم: ${platform}\n` +
        (notes ? `📝 توضیحات: ${notes}\n` : '') +
        `⏰ زمان ثبت: ${new Date().toLocaleDateString('fa-IR')}\n` +
        `➖➖➖➖➖➖➖➖\n` +
        `سلام! مایل به دریافت و پرداخت این سفارش هستم.`;

      const encodedMsg = encodeURIComponent(message);
      // Official Telegram Bot or Support link
      const telegramUrl = `https://t.me/WyrexSMP_Bot?start=order_${encodeURIComponent(ign)}&text=${encodedMsg}`;
      
      closeModal();
      showToast('در حال انتقال به تلگرام جهت نهایی‌سازی سفارش...');
      
      setTimeout(() => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent('https://wyrexmc.com')}&text=${encodedMsg}`, '_blank');
      }, 700);
    });
  }
}

function populateModal(modal, product) {
  const titleEl = modal.querySelector('#modal-product-name');
  const priceEl = modal.querySelector('#modal-product-price');
  const imgEl = modal.querySelector('#modal-product-img');

  if (titleEl) titleEl.textContent = product.title;
  if (priceEl) priceEl.textContent = `${product.toman} (${product.usd})`;
  if (imgEl) imgEl.src = product.img;
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        const b = i.querySelector('.faq-body');
        if (b) b.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   RULES SEARCH & FILTER
   ========================================================================== */
function initRulesSearch() {
  const rulesSearchInput = document.getElementById('rules-search');
  const ruleCards = document.querySelectorAll('.rule-card');
  const ruleFilters = document.querySelectorAll('.rule-filter-pill');

  if (!ruleCards.length) return;

  let activeSection = 'all';
  let searchText = '';

  function applyRulesFilter() {
    ruleCards.forEach(card => {
      const section = card.getAttribute('data-section');
      const title = (card.querySelector('.rule-title')?.textContent || '').toLowerCase();
      const body = (card.querySelector('.rule-text')?.textContent || '').toLowerCase();

      const matchSection = (activeSection === 'all' || section === activeSection);
      const matchSearch = !searchText || title.includes(searchText) || body.includes(searchText);

      card.style.display = (matchSection && matchSearch) ? 'flex' : 'none';
    });
  }

  if (rulesSearchInput) {
    rulesSearchInput.addEventListener('input', (e) => {
      searchText = e.target.value.trim().toLowerCase();
      applyRulesFilter();
    });
  }

  ruleFilters.forEach(pill => {
    pill.addEventListener('click', () => {
      ruleFilters.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSection = pill.getAttribute('data-filter-section') || 'all';
      applyRulesFilter();
    });
  });
}

/* ==========================================================================
   TELEMETRY LIVE SIMULATOR
   ========================================================================== */
function initTelemetrySimulator() {
  const countEl = document.getElementById('live-player-counter');
  const fillBar = document.getElementById('live-player-fill');
  const pingEl = document.getElementById('live-ping-val');
  const refreshBtn = document.getElementById('btn-telemetry-refresh');

  if (!countEl && !refreshBtn) return;

  let baseCount = 542;

  function updateMetrics(simulateSpike = false) {
    const jitter = Math.floor(Math.random() * 9) - 4;
    let count = baseCount + jitter;
    if (simulateSpike) count += 15;
    
    if (countEl) countEl.textContent = count.toLocaleString('fa-IR');
    if (fillBar) {
      const pct = (count / 1000) * 100;
      fillBar.style.width = pct.toFixed(1) + '%';
    }

    if (pingEl) {
      const pings = [21, 23, 24, 25, 27, 29];
      const p = pings[Math.floor(Math.random() * pings.length)];
      pingEl.textContent = p + ' ms';
    }
  }

  // Periodic subtle fluctuation
  setInterval(() => {
    updateMetrics(false);
  }, 7000);

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const svg = refreshBtn.querySelector('svg');
      if (svg) svg.style.transform = 'rotate(360deg)';
      refreshBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        updateMetrics(true);
        if (svg) svg.style.transform = 'none';
        refreshBtn.style.pointerEvents = 'auto';
        showToast('اطلاعات سلامت شبکه و نودها با موفقیت بروزرسانی شد.');
      }, 500);
    });
  }
}

/* ==========================================================================
   SUPPORT CONTACT FORM
   ========================================================================== */
function initSupportForm() {
  const form = document.getElementById('support-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('support-name')?.value.trim();
    const emailOrTg = document.getElementById('support-contact')?.value.trim();
    const category = document.getElementById('support-category')?.value;
    const msg = document.getElementById('support-message')?.value.trim();

    if (!name || !msg) {
      showToast('لطفاً نام و متن پیام را پر کنید.');
      return;
    }

    const tgDraft = 
      `📩 تیکت پشتیبانی جدید سرور WyrexSMP\n` +
      `👤 نام: ${name}\n` +
      `📞 آیدی/ایمیل: ${emailOrTg}\n` +
      `🏷 موضوع: ${category}\n` +
      `💬 متن پیام:\n${msg}`;

    showToast('پیام شما با موفقیت ثبت شد. در حال ارسال به پشتیبانی...');
    form.reset();

    setTimeout(() => {
      window.open(`https://t.me/WyrexSupport?text=${encodeURIComponent(tgDraft)}`, '_blank');
    }, 800);
  });
}
