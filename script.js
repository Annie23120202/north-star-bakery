"use strict";

// North Star Bakery: small, client-relevant interactions that run locally.
const bakeryItems = [
  { id: "signature-loaf", name: "Signature Artisan Loaf", category: "bread", description: "A handmade loaf for everyday meals." },
  { id: "breakfast-pastry", name: "Breakfast Pastries", category: "pastry", description: "Sweet treats for a morning visit." },
  { id: "celebration-cake", name: "Celebration Cake", category: "cake", description: "A custom cake to discuss for your gathering." },
  { id: "specialty-bread", name: "Specialty Bread", category: "bread", description: "Ask about the bread selection available this week." }
];
const storageKeys = { favorites: "northStarFavorites", category: "northStarCategory" };

function readSavedFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]");
    return Array.isArray(value) ? value.filter(id => bakeryItems.some(item => item.id === id)) : [];
  } catch (_) { return []; }
}
function readCategory() {
  try {
    const saved = localStorage.getItem(storageKeys.category) || "all";
    return ["all", "bread", "pastry", "cake"].includes(saved) ? saved : "all";
  } catch (_) { return "all"; }
}
function saveFavorites(favorites) {
  try { localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites)); }
  catch (_) { /* The feature still works for the current visit. */ }
}
function saveCategory(category) {
  try { localStorage.setItem(storageKeys.category, category); }
  catch (_) { /* Storage may be restricted in private browsing. */ }
}
function showFavoriteSummary(favorites) {
  const message = document.getElementById("favorite-summary");
  if (!message) return;
  const names = bakeryItems.filter(item => favorites.includes(item.id)).map(item => item.name);
  message.textContent = names.length ? `${names.length} saved: ${names.join(", ")}.` : "No favorites saved yet.";
}
function drawItems(category, favorites) {
  const container = document.getElementById("bakery-items");
  if (!container) return;
  container.replaceChildren();
  bakeryItems.filter(item => category === "all" || item.category === category).forEach(item => {
    const card = document.createElement("article");
    card.className = "item-card";
    const heading = document.createElement("h3"); heading.textContent = item.name;
    const description = document.createElement("p"); description.textContent = item.description;
    const button = document.createElement("button"); button.type = "button";
    const selected = favorites.includes(item.id);
    button.textContent = selected ? "Remove favorite" : "Save favorite";
    button.setAttribute("aria-pressed", String(selected));
    button.addEventListener("click", () => {
      const current = readSavedFavorites();
      const updated = current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id];
      saveFavorites(updated); drawItems(document.getElementById("category-filter").value, updated);
      showFavoriteSummary(updated);
    });
    card.append(heading, description, button); container.append(card);
  });
}
function setupFavorites() {
  const selector = document.getElementById("category-filter");
  if (!selector) return;
  const favorites = readSavedFavorites();
  selector.value = readCategory();
  drawItems(selector.value, favorites);
  showFavoriteSummary(favorites);
  selector.addEventListener("change", () => {
    saveCategory(selector.value);
    drawItems(selector.value, readSavedFavorites());
  });
}
function setFieldError(field, message) {
  const output = document.getElementById(`${field.id}-error`);
  if (output) output.textContent = message;
  field.setAttribute("aria-invalid", String(Boolean(message)));
}
function getError(field) {
  const value = field.value.trim();
  if (!value) return "This field is required.";
  if (field.id === "customer-name" && value.length < 2) return "Please enter at least 2 characters for your name.";
  if (field.id === "customer-email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address, such as name@example.com.";
  if (field.id === "item-details" && value.length < 10) return "Please add at least 10 characters about your request.";
  return "";
}
function validateField(field) {
  const error = getError(field); setFieldError(field, error); return !error;
}
function setupForm() {
  const form = document.getElementById("bakery-contact-form");
  if (!form) return;
  const fields = ["customer-name", "customer-email", "request-type", "item-details"].map(id => document.getElementById(id));
  fields.forEach(field => { field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); }); field.addEventListener("change", () => validateField(field)); });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    const status = document.getElementById("form-status");
    if (!valid) { status.textContent = "Please correct the highlighted fields before reviewing your request."; fields.find(field => field.getAttribute("aria-invalid") === "true").focus(); return; }
    status.textContent = "Your request details look ready. This demo does not send orders; contact the bakery to confirm availability.";
  });
}
document.addEventListener("DOMContentLoaded", () => { setupFavorites(); setupForm(); });
