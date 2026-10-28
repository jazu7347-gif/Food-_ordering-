// ---------- Menu data ----------
const MENU = [
{ id: 1, name: "Margherita Pizza", category: "Pizza", price: 249, emoji: "🍕", description: "Tomato sauce, mozzarella and fresh basil." },
{ id: 2, name: "Pepperoni Pizza", category: "Pizza", price: 329, emoji: "🍕", description: "Spicy pepperoni with melted cheese." },
{ id: 3, name: "Veggie Supreme Pizza", category: "Pizza", price: 299, emoji: "🍕", description: "Capsicum, onion, corn and olives." },
{ id: 4, name: "Chicken Burger", category: "Burgers", price: 179, emoji: "🍔", description: "Crispy chicken patty with lettuce and mayo." },
{ id: 5, name: "Veg Burger", category: "Burgers", price: 129, emoji: "🍔", description: "Crunchy veg patty with cheese slice." },
{ id: 6, name: "Double Cheese Burger", category: "Burgers", price: 219, emoji: "🍔", description: "Two cheese slices with a juicy patty." },
{ id: 7, name: "Chicken Biryani", category: "Biryani", price: 199, emoji: "🍛", description: "Basmati rice cooked with spiced chicken." },
{ id: 8, name: "Mutton Biryani", category: "Biryani", price: 349, emoji: "🍛", description: "Slow-cooked mutton with aromatic rice." },
{ id: 9, name: "Veg Biryani", category: "Biryani", price: 149, emoji: "🍛", description: "Mixed vegetables with fragrant spices." },
{ id: 10, name: "Mango Lassi", category: "Drinks", price: 89, emoji: "🥭", description: "Chilled yogurt drink with mango pulp." },
{ id: 11, name: "Cold Coffee", category: "Drinks", price: 119, emoji: "☕", description: "Creamy iced coffee blended with milk." },
{ id: 12, name: "Fresh Lime Soda", category: "Drinks", price: 69, emoji: "🍋", description: "Refreshing lime with soda water." },
{ id: 13, name: "Chocolate Brownie", category: "Desserts", price: 149, emoji: "🍫", description: "Warm brownie with dark chocolate chunks." },
{ id: 14, name: "Gulab Jamun", category: "Desserts", price: 79, emoji: "🍮", description: "Soft milk dumplings in sugar syrup." },
];

// ---------- State ----------
const CART_KEY = "foodCart";
let cart = loadCart();              // { itemId: quantity }
let activeCategory = "All";
let searchTerm = "";
let orderSubmitted = false;

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const menuGrid = $("menuGrid"), cartItems = $("cartItems"), emptyMsg = $("emptyMsg");
const summary = $("summary"), checkoutForm = $("checkoutForm"), successMsg = $("successMsg");

// ---------- Local Storage ----------
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---------- Menu: categories, search, filter ----------
function renderFilters() {
  const categories = ["All", ...new Set(MENU.map(item => item.category))];
  $("categoryFilters").innerHTML = categories.map(cat =>
    `<button class="${cat === activeCategory ? "active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");
}

function renderMenu() {
  const term = searchTerm.trim().toLowerCase();
  const items = MENU.filter(item =>
    (activeCategory === "All" || item.category === activeCategory) &&
    item.name.toLowerCase().includes(term)
  );
  menuGrid.innerHTML = items.map(item => `
    <div class="card">
      <div class="img">${item.emoji}</div>
      <div class="body">
        <span class="tag">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="foot">
          <span class="price">Rs. ${item.price}</span>
          <button class="add-btn" data-add="${item.id}">+ Add</button>
        </div>
      </div>
    </div>`).join("");
  $("noResults").hidden = items.length > 0;
}

// ---------- Cart operations ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  orderSubmitted = false;
  saveCart();
  renderCart();
}

function changeQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart).map(([id, qty]) => ({
    item: MENU.find(m => m.id === Number(id)), qty
  }));

  // Order submitted -> show success message only
  if (orderSubmitted) {
    successMsg.hidden = false;
    cartItems.innerHTML = "";
    emptyMsg.hidden = true; summary.hidden = true; checkoutForm.hidden = true;
    return;
  }
  successMsg.hidden = true;

  // Empty cart -> show empty message only
  if (entries.length === 0) {
    cartItems.innerHTML = "";
    emptyMsg.hidden = false; summary.hidden = true; checkoutForm.hidden = true;
    return;
  }

  emptyMsg.hidden = true; summary.hidden = false; checkoutForm.hidden = false;
  let total = 0, count = 0;
  cartItems.innerHTML = entries.map(({ item, qty }) => {
    const subtotal = item.price * qty;
    total += subtotal; count += qty;
    return `
      <div class="cart-item">
        <span>${item.name}</span>
        <span class="sub">Rs. ${subtotal}</span>
        <div class="qty">
          <button data-action="dec" data-id="${item.id}">-</button>
          <span>${qty}</span>
          <button data-action="inc" data-id="${item.id}">+</button>
        </div>
        <button class="remove" data-action="remove" data-id="${item.id}">Remove</button>
      </div>`;
  }).join("");
  $("itemCount").textContent = count;
  $("orderTotal").textContent = `Rs. ${total}`;
}

// ---------- Validation ----------
function showError(fieldId, message) {
  const field = $(fieldId);
  field.classList.toggle("invalid", !!message);
  document.querySelector(`.error[data-for="${fieldId}"]`).textContent = message;
  return !message;
}

function validateCustomer() {
  const name = $("custName").value.trim();
  const phone = $("custPhone").value.replace(/\s+/g, "");
  const address = $("custAddress").value.trim();

  let ok = true;
  ok &= showError("custName", name.length < 3 ? "Name must be at least 3 characters." : "");
  ok &= showError("custPhone", /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number.");
  ok &= showError("custAddress", address.length < 10 ? "Address must be at least 10 characters." : "");
  return Boolean(ok);
}

// ---------- Events ----------
$("categoryFilters").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  activeCategory = btn.dataset.cat;
  renderFilters();
  renderMenu();
});

$("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderMenu();
});

menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-add]");
  if (btn) addToCart(Number(btn.dataset.add));
});

cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  if (action === "inc") changeQuantity(id, 1);
  if (action === "dec") changeQuantity(id, -1);
  if (action === "remove") removeFromCart(id);
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateCustomer()) return;
  if (Object.keys(cart).length === 0) return;

  orderSubmitted = true;
  cart = {};
  saveCart();
  checkoutForm.reset();
  renderCart();
});

// ---------- Start ----------
renderFilters();
renderMenu();
renderCart();   // restores cart saved in Local Storage on reload
