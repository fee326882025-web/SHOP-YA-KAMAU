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

const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productImageInput = document.getElementById('productImage');
const productDescriptionInput = document.getElementById('productDescription');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const adminProductGrid = document.getElementById('adminProductGrid');
const formTitle = document.getElementById('formTitle');

// Load products for admin management
function loadAdminProducts() {
  db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    adminProductGrid.innerHTML = '';
    if (snapshot.empty) {
      adminProductGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light);">No products found in inventory.</p>';
      return;
    }

    snapshot.forEach((doc) => {
      const product = doc.data();
      const id = doc.id;

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
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button onclick="editProduct('${id}', '${escapeJs(product.name)}', ${product.price}, '${escapeJs(product.imageUrl)}', '${escapeJs(product.description || '')}')">Edit</button>
            <button class="danger" onclick="deleteProduct('${id}')">Delete</button>
          </div>
        </div>
      `;
      adminProductGrid.appendChild(card);
    });
  }, (error) => {
    console.error("Error loading products: ", error);
    adminProductGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--danger-color);">Error loading products from Firebase.</p>';
  });
}

// Handle form submission for Add / Update
productForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = productIdInput.value;
  const name = productNameInput.value.trim();
  const price = parseFloat(productPriceInput.value);
  const imageUrl = productImageInput.value.trim();
  const description = productDescriptionInput.value.trim();

  if (!imageUrl) {
    alert('Please enter a valid image URL.');
    return;
  }

  const productData = {
    name,
    price,
    imageUrl,
    description,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (id) {
    db.collection('products').doc(id).update({
      name,
      price,
      imageUrl,
      description
    })
    .then(() => {
      resetForm();
      alert('Product updated successfully!');
    })
    .catch((error) => {
      console.error("Error updating product: ", error);
      alert('Failed to update product.');
    });
  } else {
    db.collection('products').add(productData)
    .then(() => {
      resetForm();
      alert('Product added successfully!');
    })
    .catch((error) => {
      console.error("Error adding product: ", error);
      alert('Failed to add product.');
    });
  }
});

window.editProduct = function(id, name, price, imageUrl, description) {
  productIdInput.value = id;
  productNameInput.value = name;
  productPriceInput.value = price;
  productImageInput.value = imageUrl;
  productDescriptionInput.value = description;
  
  formTitle.textContent = 'Edit Product';
  saveBtn.textContent = 'Update Product';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = function(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    db.collection('products').doc(id).delete()
    .then(() => {
      if (productIdInput.value === id) {
        resetForm();
      }
    })
    .catch((error) => {
      console.error("Error deleting product: ", error);
      alert('Failed to delete product.');
    });
  }
};

function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  formTitle.textContent = 'Add New Product';
  saveBtn.textContent = 'Add Product';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

loadAdminProducts();
