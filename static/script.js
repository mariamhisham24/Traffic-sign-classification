/**
 * Traffic Sign Recognition System — Frontend Logic
 * =================================================
 * Handles: drag & drop, image preview, form submission,
 *          prediction display, dark mode toggle, error handling.
 */

"use strict";

/* ── DOM References ─────────────────────────────────────────────────────── */
const dropZone       = document.getElementById("dropZone");
const dropZoneInner  = document.getElementById("dropZoneInner");
const previewWrap    = document.getElementById("previewWrap");
const fileInput      = document.getElementById("fileInput");
const previewImg     = document.getElementById("previewImg");
const previewFilename= document.getElementById("previewFilename");
const clearBtn       = document.getElementById("clearBtn");
const uploadForm     = document.getElementById("uploadForm");
const predictBtn     = document.getElementById("predictBtn");
const btnLabel       = predictBtn.querySelector(".btn-label");
const btnSpinner     = predictBtn.querySelector(".btn-spinner");
const errorBanner    = document.getElementById("errorBanner");
const errorText      = document.getElementById("errorText");

const uploadSection  = document.getElementById("uploadSection");
const resultsSection = document.getElementById("resultsSection");
const resultImg      = document.getElementById("resultImg");
const resultClass    = document.getElementById("resultClass");
const confidencePct  = document.getElementById("confidencePct");
const confidenceBar  = document.getElementById("confidenceBar");
const top5List       = document.getElementById("top5List");
const resetBtn       = document.getElementById("resetBtn");

const themeToggle    = document.getElementById("themeToggle");
const themeIcon      = document.getElementById("themeIcon");

/* ── Theme ──────────────────────────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(saved || preferred);
})();

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.className = theme === "dark" ? "ph ph-sun" : "ph ph-moon";
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ── Drag & Drop ────────────────────────────────────────────────────────── */
["dragenter", "dragover"].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  })
);

["dragleave", "drop"].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
  })
);

dropZone.addEventListener("drop", e => {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) handleFile(files[0]);
});

// Click on drop zone (not on buttons) also opens file dialog
dropZone.addEventListener("click", e => {
  if (e.target === dropZone || e.target === dropZoneInner ||
      e.target.classList.contains("drop-primary") ||
      e.target.classList.contains("drop-secondary") ||
      e.target.classList.contains("drop-icon") ||
      e.target.classList.contains("drop-icon-wrap") ||
      e.target.classList.contains("drop-hint")) {
    fileInput.click();
  }
});

dropZone.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});

/* ── File validation & preview ──────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/bmp", "image/webp"];
const MAX_SIZE_MB   = 8;

function handleFile(file) {
  hideError();

  if (!ALLOWED_TYPES.includes(file.type)) {
    showError("Unsupported file type. Please upload a PNG, JPG, BMP, or WebP image.");
    return;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    showError(`File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
    return;
  }

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src      = e.target.result;
    previewFilename.textContent = file.name;
    dropZoneInner.hidden = true;
    previewWrap.hidden   = false;
    predictBtn.disabled  = false;
  };
  reader.readAsDataURL(file);

  // Attach file to hidden input (needed for the FormData below)
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
}

/* ── Clear selection ────────────────────────────────────────────────────── */
clearBtn.addEventListener("click", resetUpload);

function resetUpload() {
  fileInput.value     = "";
  previewImg.src      = "";
  previewFilename.textContent = "";
  dropZoneInner.hidden = false;
  previewWrap.hidden   = true;
  predictBtn.disabled  = true;
  hideError();
}

/* ── Form Submission / Prediction ───────────────────────────────────────── */
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!fileInput.files.length) {
    showError("Please select an image first.");
    return;
  }

  setLoading(true);
  hideError();

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  try {
    const res  = await fetch("/predict", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "An unexpected error occurred. Please try again.");
      return;
    }

    displayResults(data);

  } catch (err) {
    showError("Could not reach the server. Check your connection and try again.");
    console.error("[predict]", err);
  } finally {
    setLoading(false);
  }
});

/* ── Display Results ────────────────────────────────────────────────────── */
function displayResults(data) {
  // Populate result image
  resultImg.src = data.image_data_url;

  // Populate class + confidence
  resultClass.textContent  = data.predicted_class;
  confidencePct.textContent = `${data.confidence}%`;

  // Animate confidence bar (wait a tick for render)
  confidenceBar.style.width = "0%";
  requestAnimationFrame(() => {
    setTimeout(() => {
      confidenceBar.style.width = `${data.confidence}%`;
    }, 80);
  });

  // Top-5 list
  top5List.innerHTML = "";
  data.top5.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "top5-item" + (idx === 0 ? " top1" : "");

    li.innerHTML = `
      <span class="top5-rank">${idx + 1}</span>
      <span class="top5-name" title="${escHtml(item.class_name)}">${escHtml(item.class_name)}</span>
      <span class="top5-bar-wrap">
        <span class="top5-bar" style="width:${item.confidence}%"></span>
      </span>
      <span class="top5-conf">${item.confidence}%</span>
    `;
    top5List.appendChild(li);
  });

  // Toggle visibility
  uploadSection.hidden  = true;
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Reset (try another) ────────────────────────────────────────────────── */
resetBtn.addEventListener("click", () => {
  resultsSection.hidden = true;
  uploadSection.hidden  = false;
  resetUpload();
  uploadSection.scrollIntoView({ behavior: "smooth" });
});

/* ── Loading state helpers ──────────────────────────────────────────────── */
function setLoading(on) {
  predictBtn.disabled    = on;
  btnLabel.hidden        = on;
  btnSpinner.hidden      = !on;
}

/* ── Error helpers ──────────────────────────────────────────────────────── */
function showError(msg) {
  errorText.textContent  = msg;
  errorBanner.hidden     = false;
}
function hideError() {
  errorBanner.hidden = true;
  errorText.textContent = "";
}

/* ── HTML escape helper ─────────────────────────────────────────────────── */
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
