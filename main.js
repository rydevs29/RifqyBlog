/* ==============================
   STATE
============================== */
const articlesGrid = document.getElementById("articlesGrid");
const categoryList = document.getElementById("categoryList");
const searchInput = document.getElementById("searchInput");
const loadMoreButton = document.getElementById("loadMore");
const emptyState = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

let selectedCategory = "Semua";
let searchKeyword = "";
let visibleCount = 6;

// Pastikan 'articles' sudah tersedia dari artikel-lama.js
if (typeof articles === "undefined") {
  console.error("❌ Array 'articles' belum tersedia! Pastikan artikel-baru.js dan artikel-lama.js sudah di-load terlebih dahulu.");
}

const categories = [
  "Semua",
  ...new Set(articles.map(article => article.category))
];

/* ==============================
   RENDER CATEGORIES
============================== */
function renderCategories() {
  categoryList.innerHTML = categories
    .map(category => `
      <button
        class="category-btn ${category === selectedCategory ? "active" : ""}"
        data-category="${category}"
      >
        ${category}
      </button>
    `)
    .join("");

  document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      visibleCount = 6;
      renderCategories();
      renderArticles();
    });
  });
}

/* ==============================
   FILTER & RENDER ARTICLES
============================== */
function getFilteredArticles() {
  const keyword = searchKeyword.toLowerCase().trim();

  return articles.filter(article => {
    const matchesCategory =
      selectedCategory === "Semua" ||
      article.category === selectedCategory;

    const matchesKeyword =
      article.title.toLowerCase().includes(keyword) ||
      article.category.toLowerCase().includes(keyword) ||
      article.excerpt.toLowerCase().includes(keyword);

    return matchesCategory && matchesKeyword;
  });
}

function renderArticles() {
  const filteredArticles = getFilteredArticles();
  const visibleArticles = filteredArticles.slice(0, visibleCount);

  resultCount.textContent =
    `${filteredArticles.length} artikel ditemukan`;

  articlesGrid.innerHTML = visibleArticles
    .map(article => {
      const originalIndex = articles.indexOf(article);

      return `
        <article class="article-card">
          <div class="article-image">
            <img
              src="${article.image}"
              alt="${article.title}"
              loading="lazy"
            />
            <span class="article-category">${article.category}</span>
          </div>

          <div class="article-body">
            <div class="article-meta">
              <span>${article.date}</span>
              <span>${article.readTime}</span>
            </div>

            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>

            <div class="article-footer">
              <div class="author">
                <span class="author-avatar">RD</span>
                <span>RifqyDevices</span>
              </div>

              <button
                class="read-btn"
                data-index="${originalIndex}"
              >
                Baca →
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  emptyState.classList.toggle("show", filteredArticles.length === 0);
  loadMoreButton.style.display =
    filteredArticles.length > visibleCount ? "inline-flex" : "none";

  document.querySelectorAll(".read-btn").forEach(button => {
    button.addEventListener("click", () => {
      openArticle(Number(button.dataset.index));
    });
  });
}

searchInput.addEventListener("input", event => {
  searchKeyword = event.target.value;
  visibleCount = 6;
  renderArticles();
});

loadMoreButton.addEventListener("click", () => {
  visibleCount += 6;
  renderArticles();
});

/* ==============================
   ARTICLE MODAL
============================== */
const articleModal = document.getElementById("articleModal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalCategory = document.getElementById("modalCategory");
const modalDate = document.getElementById("modalDate");
const modalReadTime = document.getElementById("modalReadTime");
const modalTitle = document.getElementById("modalTitle");
const modalArticle = document.getElementById("modalArticle");

function openArticle(index) {
  const article = articles[index];

  modalImage.src = article.image;
  modalImage.alt = article.title;
  modalCategory.textContent = article.category;
  modalDate.textContent = article.date;
  modalReadTime.textContent = article.readTime;
  modalTitle.textContent = article.title;
  modalArticle.innerHTML = article.content;

  articleModal.classList.add("show");
  articleModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeArticle() {
  articleModal.classList.remove("show");
  articleModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

modalClose.addEventListener("click", closeArticle);

articleModal.addEventListener("click", event => {
  if (event.target === articleModal) {
    closeArticle();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeArticle();
  }
});

document.getElementById("featuredRead").addEventListener("click", () => {
  openArticle(0);
});

/* ==============================
   DARK MODE
============================== */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme) {
  const darkMode = theme === "dark";
  document.body.classList.toggle("dark", darkMode);
  themeIcon.textContent = darkMode ? "☀️" : "🌙";
  localStorage.setItem("rifqyblog-theme", theme);
}

const savedTheme = localStorage.getItem("rifqyblog-theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

applyTheme(savedTheme || (systemDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.body.classList.contains("dark") ? "light" : "dark";

  applyTheme(nextTheme);
});

/* ==============================
   MOBILE MENU
============================== */
const menuToggle = document.getElementById("menuToggle");
const menuIcon = document.getElementById("menuIcon");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
  menuIcon.textContent = navMenu.classList.contains("show") ? "✕" : "☰";
});

document.querySelectorAll(".nav-menu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("show");
    menuIcon.textContent = "☰";
  });
});

document.addEventListener("click", event => {
  const clickedOutside =
    !navMenu.contains(event.target) &&
    !menuToggle.contains(event.target);

  if (clickedOutside) {
    navMenu.classList.remove("show");
    menuIcon.textContent = "☰";
  }
});

/* ==============================
   NEWSLETTER & TOAST
============================== */
const newsletterForm = document.getElementById("newsletterForm");
const emailInput = document.getElementById("emailInput");
const toast = document.getElementById("toast");

let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

newsletterForm.addEventListener("submit", event => {
  event.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    showToast("Silakan masukkan alamat email.");
    return;
  }

  showToast("🎉 Berhasil! Kamu telah bergabung dengan RifqyBlog.");
  newsletterForm.reset();
});

/* ==============================
   ACTIVE NAVIGATION
============================== */
const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {
  let currentSection = "beranda";

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 160) {
      currentSection = section.id;
    }
  });

  navigationLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`
    );
  });
});

/* ==============================
   INITIALIZATION
============================== */
document.getElementById("year").textContent = new Date().getFullYear();

renderCategories();
renderArticles();
