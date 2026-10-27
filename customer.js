// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForShopYaKamau-12345",
  authDomain: "shop-ya-kamau.firebaseapp.com",
  projectId: "shop-ya-kamau",
  storageBucket: "shop-ya-kamau.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const productGrid = document.getElementById('productGrid');

// Load products for customers
function loadCustomerProducts() {
  db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    productGrid.innerHTML = '';
    if (snapshot.empty) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No products currently available in store.</p>';
      return;
    }

    snapshot.forEach((doc) => {
      const product = doc.data();

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300?text=Image+Load+Error'">
        <div class="product-info">
          <div>
            <div class="product-title">${escapeHtml(product.name)}</div>
            <div class="product-price">KES ${Number(product.price).toLocaleString()}</div>
            <div class="product-description">${escapeHtml(product.description || '')}</div>
          </div>
          <button onclick="window.open('https://wa.me/?text=I%20am%20interested%20in%20${encodeURIComponent(product.name)}%20priced%20at%20KES%20${product.price}', '_blank')" style="margin-top: 12px; width: 100%;">Inquire via WhatsApp</button>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }, (error) => {
    console.error("Error loading products: ", error);
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Error loading store products.</p>';
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

loadCustomerProducts();
