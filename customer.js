  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB0cb_OmjsYhUTsVALTgfXI0k_FbYkv8js",
    authDomain: "shop-ya-kamau.firebaseapp.com",
    projectId: "shop-ya-kamau",
    storageBucket: "shop-ya-kamau.firebasestorage.app",
    messagingSenderId: "296307002477",
    appId: "1:296307002477:web:eea0703885b05edb4dc364",
    measurementId: "G-QD88XV0H7D"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
const DEFAULT_SETTINGS = {
    storeName: "SHOP YA KAMAU",
    currency: "KSh",
    phone: "+254 712 345 678",
    whatsapp: "254712345678",
    instagram: "@SHOPYAKAMAU",
    facebook: "facebook.com/shopyakamau",
    location: "Commercial Avenue, Suite 400, Nairobi, Kenya",
    mapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.83543450937!2d144.9537353153166!3d-37.81627977975171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s",
    deliveryFee: 200.00,
    bgUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80",
    adminPassword: "admin123"
};

const INITIAL_PRODUCTS = [
    {
        id: "prod_1",
        title: "Wireless Noise-Canceling Headphones",
        price: 12900.00,
        category: "Electronics",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Premium over-ear headphones with deep bass, 30-hour battery life, and spatial audio support."
    },
    {
        id: "prod_2",
        title: "Minimalist Smart Watch Series V",
        price: 18900.00,
        category: "Electronics",
        images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Sleek fitness tracking smartwatch with heart rate sensor, OLED display, and water resistance."
    },
    {
        id: "prod_3",
        title: "Ergonomic Urban Daypack",
        price: 6400.00,
        category: "Fashion & Bags",
        images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
        ],
        description: "Water-resistant daily backpack with laptop sleeve, hidden security pocket, and USB port."
    }
];

let settings = JSON.parse(localStorage.getItem('shopyakamau_settings')) || DEFAULT_SETTINGS;
let products = JSON.parse(localStorage.getItem('shopyakamau_products')) || INITIAL_PRODUCTS;
let orders = JSON.parse(localStorage.getItem('shopyakamau_orders')) || [];
let cart = JSON.parse(localStorage.getItem('shopyakamau_cart')) || [];
let selectedCategory = 'All';

function formatMoney(amount) {
    const sym = settings.currency || 'KSh';
    return `${sym} ${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

window.onload = function() {
    document.getElementById('year-copy').textContent = new Date().getFullYear();
    syncStoreData();
    renderCustomerProducts();
    updateCartUI();
};

function saveData() {
    localStorage.setItem('shopyakamau_settings', JSON.stringify(settings));
    localStorage.setItem('shopyakamau_products', JSON.stringify(products));
    localStorage.setItem('shopyakamau_orders', JSON.stringify(orders));
    localStorage.setItem('shopyakamau_cart', JSON.stringify(cart));
    syncStoreData();
}

function syncStoreData() {
    document.getElementById('store-nav-title').textContent = settings.storeName;
    document.getElementById('hero-store-title').textContent = `Welcome to ${settings.storeName}`;
    document.getElementById('hero-store-location').innerHTML = `<i class="fa-solid fa-location-dot text-brand-500 mr-1.5"></i> ${settings.location}`;
    document.getElementById('footer-store-name').textContent = settings.storeName;
    document.getElementById('footer-address').textContent = settings.location;
    document.getElementById('footer-phone').textContent = settings.phone;
    document.getElementById('footer-whatsapp').textContent = settings.whatsapp;

    const mapsBtn = document.getElementById('footer-maps-btn');
    const mapsIframe = document.getElementById('footer-maps-iframe');
    const mapsPlaceholder = document.getElementById('footer-maps-placeholder');

    let directMapLink = "https://maps.google.com/?q=" + encodeURIComponent(settings.location);
    let embedUrl = "";

    if (settings.mapsUrl) {
        if (settings.mapsUrl.includes('<iframe')) {
            const srcMatch = settings.mapsUrl.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) embedUrl = srcMatch[1];
        } else if (settings.mapsUrl.includes('google.com/maps/embed')) {
            embedUrl = settings.mapsUrl;
        } else {
            directMapLink = settings.mapsUrl;
        }
    }

    mapsBtn.href = directMapLink;

    if (embedUrl) {
        mapsIframe.src = embedUrl;
        mapsIframe.classList.remove('hidden');
        mapsPlaceholder.classList.add('hidden');
    } else {
        mapsIframe.classList.add('hidden');
        mapsPlaceholder.classList.remove('hidden');
    }

    document.getElementById('nav-whatsapp-link').href = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`;
    document.getElementById('nav-phone-link').href = `tel:${settings.phone}`;
    document.getElementById('nav-instagram-link').href = settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@','')}`;
    document.getElementById('nav-facebook-link').href = settings.facebook.startsWith('http') ? settings.facebook : `https://${settings.facebook}`;

    document.getElementById('footer-link-wa').href = document.getElementById('nav-whatsapp-link').href;
    document.getElementById('footer-link-ig').href = document.getElementById('nav-instagram-link').href;
    document.getElementById('footer-link-fb').href = document.getElementById('nav-facebook-link').href;
}

function renderCustomerProducts() {
    const grid = document.getElementById('customer-products-grid');
    const searchVal = document.getElementById('customer-search-input').value.toLowerCase();
    const emptyState = document.getElementById('no-products-state');

    const categories = ['All', ...new Set(products.map(p => p.category))];
    const catContainer = document.getElementById('category-filter-container');
    catContainer.innerHTML = categories.map(cat => `
        <button onclick="filterCategory('${cat}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
            ${cat}
        </button>
    `).join('');

    const filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchVal) || p.description.toLowerCase().includes(searchVal);
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    grid.innerHTML = filtered.map(product => {
        const imgList = (product.images && product.images.length > 0) ? product.images : [product.image || 'https://placehold.co/600x400/0ea5e9/ffffff?text=Product'];
        const mainImg = imgList[0];

        const thumbnailsHtml = imgList.length > 1 ? `
            <div class="flex items-center gap-1.5 p-2 bg-slate-50 border-t border-slate-100 overflow-x-auto">
                ${imgList.map((img, idx) => `
                    <img src="${img}" onclick="switchCardImage('${product.id}', '${img}', this)" class="w-8 h-8 object-cover rounded-lg border-2 cursor-pointer transition opacity-70 hover:opacity-100 ${idx === 0 ? 'thumb-active' : 'border-transparent'}">
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                <div class="h-48 overflow-hidden bg-slate-100 relative">
                    <img id="card-img-${product.id}" src="${mainImg}" alt="${product.title}" onerror="this.src='https://placehold.co/600x400/0ea5e9/ffffff?text=Product+Image'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                    <span class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                        ${product.category}
                    </span>
                    ${imgList.length > 1 ? `<span class="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md"><i class="fa-solid fa-images mr-1"></i>${imgList.length} Photos</span>` : ''}
                </div>
                ${thumbnailsHtml}
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-slate-900 text-base leading-snug line-clamp-1">${product.title}</h3>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${product.description}</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span class="text-xs text-slate-400 block font-medium">Price</span>
                            <span class="text-base font-extrabold text-slate-900">${formatMoney(product.price)}</span>
                        </div>
                        <button onclick="addToCart('${product.id}')" class="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20 transition flex items-center gap-1.5">
                            <i class="fa-solid fa-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function switchCardImage(prodId, newSrc, thumbEl) {
    const cardImg = document.getElementById(`card-img-${prodId}`);
    if (cardImg) cardImg.src = newSrc;
    
    const parentContainer = thumbEl.parentElement;
    parentContainer.querySelectorAll('img').forEach(img => img.classList.remove('thumb-active'));
    thumbEl.classList.add('thumb-active');
}

function filterCategory(cat) {
    selectedCategory = cat;
    renderCustomerProducts();
}

function scrollToProducts() {
    document.getElementById('customer-products-grid').scrollIntoView({ behavior: 'smooth' });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const imgList = (product.images && product.images.length > 0) ? product.images : [product.image || 'https://placehold.co/600x400/0ea5e9/ffffff?text=Product'];

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: parseFloat(product.price),
            image: imgList[0],
            qty: 1
        });
    }
    saveData();
    updateCartUI();
    showToast(`Added "${product.title}" to cart!`);
}

function updateCartQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
    }
    saveData();
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cart-badge-count').textContent = totalItems;

    const container = document.getElementById('cart-items-container');
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <i class="fa-solid fa-basket-shopping text-4xl mb-2 text-slate-300"></i>
                <p class="text-sm font-medium">Your shopping cart is empty</p>
            </div>
        `;
        document.getElementById('cart-subtotal').textContent = formatMoney(0);
        document.getElementById('cart-delivery-fee').textContent = formatMoney(0);
        document.getElementById('cart-total-price').textContent = formatMoney(0);
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('checkout-btn').classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    document.getElementById('checkout-btn').disabled = false;
    document.getElementById('checkout-btn').classList.remove('opacity-50', 'cursor-not-allowed');

    container.innerHTML = cart.map(item => `
        <div class="flex items-center gap-3 pt-3">
            <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-cover rounded-xl bg-slate-100">
            <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-slate-800 truncate">${item.title}</h4>
                <p class="text-xs text-brand-600 font-bold mt-0.5">${formatMoney(item.price)}</p>
                <div class="flex items-center gap-2 mt-2">
                    <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">-</button>
                    <span class="text-xs font-bold text-slate-800">${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">+</button>
                </div>
            </div>
            <div class="text-right">
                <span class="text-xs font-extrabold text-slate-900">${formatMoney(item.price * item.qty)}</span>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = parseFloat(settings.deliveryFee) || 0;
    const total = subtotal + deliveryFee;

    document.getElementById('cart-subtotal').textContent = formatMoney(subtotal);
    document.getElementById('cart-delivery-fee').textContent = formatMoney(deliveryFee);
    document.getElementById('cart-total-price').textContent = formatMoney(total);
    document.getElementById('checkout-modal-total').textContent = formatMoney(total);
}

function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (open) {
        overlay.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
    } else {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

function openCheckoutModal() {
    toggleCartDrawer(false);
    document.getElementById('checkout-modal').classList.remove('hidden');
}

function toggleCheckoutModal(open) {
    const modal = document.getElementById('checkout-modal');
    if (open) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

// Compute official Nairobi Date and Time (EAT - Africa/Nairobi)
function getNairobiTimestamp() {
    const now = new Date();
    const options = {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-GB', options).format(now) + ' EAT';
}

function submitCustomerOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const timePref = document.getElementById('cust-time').value || 'ASAP';
    const channel = document.querySelector('input[name="contact-channel"]:checked').value;

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = parseFloat(settings.deliveryFee) || 0;
    const total = subtotal + deliveryFee;

    // Official Nairobi Time
    const nairobiTime = getNairobiTimestamp();

    const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        dateTime: nairobiTime,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        deliveryTime: timePref,
        items: [...cart],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'Pending Delivery',
        contactChannel: channel
    };

    orders.unshift(newOrder);
    cart = [];
    saveData();
    updateCartUI();
    toggleCheckoutModal(false);

    showToast("Order submitted successfully!");

    const itemsSummary = newOrder.items.map(i => `• ${i.title} (Qty: ${i.qty}) - ${formatMoney(i.price * i.qty)}`).join('\n');
    const orderText = `Hello, I wish to make the following order(s):\n\n*ORDER ID:* #${newOrder.id}\n*Date & Time (Nairobi EAT):* ${nairobiTime}\n\n*CUSTOMER DETAILS:*\nName: ${name}\nPhone: ${phone}\nDelivery Address: ${address}\nRequested Delivery Time: ${timePref}\n\n*ITEMS ORDERED:*\n${itemsSummary}\n\n*Subtotal:* ${formatMoney(subtotal)}\n*Delivery Fee:* ${formatMoney(deliveryFee)}\n*TOTAL PAYABLE:* ${formatMoney(total)}`;

    if (channel === 'whatsapp') {
        const cleanWa = settings.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(orderText)}`, '_blank');
    } else if (channel === 'phone') {
        window.location.href = `tel:${settings.phone}`;
    } else if (channel === 'sms') {
        window.location.href = `sms:${settings.phone}?body=${encodeURIComponent(orderText)}`;
    } else if (channel === 'instagram') {
        const cleanIg = settings.instagram.replace('@', '');
        window.open(`https://instagram.com/${cleanIg}`, '_blank');
    }
}

function showToast(msg) {
    const toast = document.getElementById('global-toast');
    document.getElementById('toast-message').textContent = msg;
    toast.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    }, 3000);
}
