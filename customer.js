// ==========================================
// SHOP YA KAMAU - CUSTOMER FRONTEND LOGIC
// ==========================================

// YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyB0cb_OmjsYhUTsVALTgfXI0k_FbYkv8js",
    authDomain: "shop-ya-kamau.firebaseapp.com",
    projectId: "shop-ya-kamau",
    storageBucket: "shop-ya-kamau.firebasestorage.app",
    messagingSenderId: "296307002477",
    appId: "1:296307002477:web:eea0703885b05edb4dc364",
    measurementId: "G-QD88XV0H7D"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

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
    }
];

let settings = DEFAULT_SETTINGS;
let products = [];
let orders = [];
let cart = JSON.parse(localStorage.getItem('shopyakamau_cart')) || [];
let selectedCategory = 'All';

// ==========================================
// SAFE DOM UPDATE HELPERS (Prevents Null Errors)
// ==========================================
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function safeSetHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function safeSetHref(id, href) {
    const el = document.getElementById(id);
    if (el) el.href = href;
}

// ==========================================
// MONEY FORMATTER
// ==========================================
function formatMoney(amount) {
    const sym = settings.currency || 'KSh';
    return `${sym} ${parseFloat(amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// ==========================================
// REAL-TIME CLOUD SYNC
// ==========================================
function initStoreRealtime() {
    db.collection("store").doc("config").onSnapshot(doc => {
        if (doc.exists) {
            settings = { ...DEFAULT_SETTINGS, ...doc.data() };
            syncStoreData();
        } else {
            db.collection("store").doc("config").set(DEFAULT_SETTINGS);
        }
    }, err => console.error("Config sync error:", err));

    db.collection("products").onSnapshot(snapshot => {
        products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        if (products.length === 0) {
            INITIAL_PRODUCTS.forEach(p => db.collection("products").doc(p.id).set(p));
        }
        renderCustomerProducts();
    }, err => console.error("Products sync error:", err));

    db.collection("orders").orderBy("dateTime", "desc").onSnapshot(snapshot => {
        orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    }, err => console.error("Orders sync error:", err));
}

window.onload = function() {
    safeSetText('year-copy', new Date().getFullYear());
    initStoreRealtime();
    updateCartUI();
};

// ==========================================
// SYNC CONFIG DATA TO UI
// ==========================================
function syncStoreData() {
    safeSetText('store-nav-title', settings.storeName);
    safeSetText('hero-store-title', `Welcome to ${settings.storeName}`);
    safeSetHTML('hero-store-location', `<i class="fa-solid fa-location-dot text-brand-500 mr-1.5"></i> ${settings.location}`);
    safeSetText('footer-store-name', settings.storeName);
    safeSetText('footer-address', settings.location);
    safeSetText('footer-phone', settings.phone);
    safeSetText('footer-whatsapp', settings.whatsapp);

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

    if (mapsBtn) mapsBtn.href = directMapLink;

    if (mapsIframe && mapsPlaceholder) {
        if (embedUrl) {
            mapsIframe.src = embedUrl;
            mapsIframe.classList.remove('hidden');
            mapsPlaceholder.classList.add('hidden');
        } else {
            mapsIframe.classList.add('hidden');
            mapsPlaceholder.classList.remove('hidden');
        }
    }

    const cleanWa = (settings.whatsapp || "").replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanWa}`;
    const phoneUrl = `tel:${settings.phone}`;
    
    let igUrl = settings.instagram || "";
    if (!igUrl.startsWith('http')) {
        igUrl = `https://instagram.com/${igUrl.replace('@','')}`;
    }

    let fbUrl = settings.facebook || "";
    if (!fbUrl.startsWith('http')) {
        fbUrl = `https://${fbUrl}`;
    }

    safeSetHref('nav-whatsapp-link', waUrl);
    safeSetHref('nav-phone-link', phoneUrl);
    safeSetHref('nav-instagram-link', igUrl);
    safeSetHref('nav-facebook-link', fbUrl);

    safeSetHref('footer-link-wa', waUrl);
    safeSetHref('footer-link-ig', igUrl);
    safeSetHref('footer-link-fb', fbUrl);
}

// ==========================================
// RENDER PRODUCTS & CATEGORIES
// ==========================================
function renderCustomerProducts() {
    const grid = document.getElementById('customer-products-grid');
    const searchInput = document.getElementById('customer-search-input');
    const emptyState = document.getElementById('no-products-state');

    if (!grid) return;

    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const catContainer = document.getElementById('category-filter-container');

    if (catContainer) {
        catContainer.innerHTML = categories.map(cat => `
            <button onclick="filterCategory('${cat}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedCategory === cat ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
                ${cat}
            </button>
        `).join('');
    }

    const filtered = products.filter(p => {
        const title = (p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const matchesSearch = title.includes(searchVal) || desc.includes(searchVal);
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    if (emptyState) emptyState.classList.add('hidden');

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
                        ${product.category || 'General'}
                    </span>
                    ${imgList.length > 1 ? `<span class="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md"><i class="fa-solid fa-images mr-1"></i>${imgList.length} Photos</span>` : ''}
                </div>
                ${thumbnailsHtml}
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-slate-900 text-base leading-snug line-clamp-1">${product.title}</h3>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${product.description || ''}</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            <span class="text-xs text-slate-400 block font-medium">Price</span>
                            <span class="text-base font-extrabold text-slate-900">${formatMoney(product.price)}</span>
                        </div>
                        <button onclick="addToCart('${product.id}')" class="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5">
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
    if (parentContainer) {
        parentContainer.querySelectorAll('img').forEach(img => img.classList.remove('thumb-active'));
    }
    thumbEl.classList.add('thumb-active');
}

function filterCategory(cat) {
    selectedCategory = cat;
    renderCustomerProducts();
}

function scrollToProducts() {
    const grid = document.getElementById('customer-products-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// CART & CHECKOUT MANAGEMENT
// ==========================================
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
    localStorage.setItem('shopyakamau_cart', JSON.stringify(cart));
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
    localStorage.setItem('shopyakamau_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    safeSetText('cart-badge-count', totalItems);

    const container = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-400">
                <i class="fa-solid fa-basket-shopping text-4xl mb-2 text-slate-300"></i>
                <p class="text-sm font-medium">Your shopping cart is empty</p>
            </div>
        `;
        safeSetText('cart-subtotal', formatMoney(0));
        safeSetText('cart-delivery-fee', formatMoney(0));
        safeSetText('cart-total-price', formatMoney(0));
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        return;
    }

    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

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

    safeSetText('cart-subtotal', formatMoney(subtotal));
    safeSetText('cart-delivery-fee', formatMoney(deliveryFee));
    safeSetText('cart-total-price', formatMoney(total));
    safeSetText('checkout-modal-total', formatMoney(total));
}

function toggleCartDrawer(open) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (!drawer || !overlay) return;

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
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('hidden');
}

function toggleCheckoutModal(open) {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    if (open) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

// ==========================================
// ORDER SUBMISSION & REDIRECTION
// ==========================================
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

    const nameInput = document.getElementById('cust-name');
    const phoneInput = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');
    const timeInput = document.getElementById('cust-time');
    const channelInput = document.querySelector('input[name="contact-channel"]:checked');

    const name = nameInput ? nameInput.value : 'Valued Customer';
    const phone = phoneInput ? phoneInput.value : '';
    const address = addressInput ? addressInput.value : '';
    const timePref = timeInput ? (timeInput.value || 'ASAP') : 'ASAP';
    const channel = channelInput ? channelInput.value : 'whatsapp';

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const deliveryFee = parseFloat(settings.deliveryFee) || 0;
    const total = subtotal + deliveryFee;

    const nairobiTime = getNairobiTimestamp();
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
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

    db.collection("orders").doc(orderId).set(newOrder).then(() => {
        cart = [];
        localStorage.setItem('shopyakamau_cart', JSON.stringify(cart));
        updateCartUI();
        toggleCheckoutModal(false);
        showToast("Order submitted successfully!");

        const itemsSummary = newOrder.items.map(i => `• ${i.title} (Qty: ${i.qty}) - ${formatMoney(i.price * i.qty)}`).join('\n');
        const orderText = `Hello, I wish to make the following order:\n\n*ORDER ID:* #${orderId}\n*Date & Time (Nairobi EAT):* ${nairobiTime}\n\n*CUSTOMER DETAILS:*\nName: ${name}\nPhone: ${phone}\nDelivery Address: ${address}\nRequested Delivery Time: ${timePref}\n\n*ITEMS ORDERED:*\n${itemsSummary}\n\n*Subtotal:* ${formatMoney(subtotal)}\n*Delivery Fee:* ${formatMoney(deliveryFee)}\n*TOTAL PAYABLE:* ${formatMoney(total)}`;

        const cleanWa = (settings.whatsapp || "").replace(/[^0-9]/g, '');

        if (channel === 'whatsapp') {
            window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(orderText)}`, '_blank');
        } else if (channel === 'phone') {
            window.location.href = `tel:${settings.phone}`;
        } else if (channel === 'sms') {
            window.location.href = `sms:${settings.phone}?body=${encodeURIComponent(orderText)}`;
        } else if (channel === 'instagram') {
            let igProfile = settings.instagram || "";
            if (!igProfile.startsWith('http')) {
                igProfile = `https://instagram.com/${igProfile.replace('@', '')}`;
            }
            window.open(igProfile, '_blank');
        }
    }).catch(err => {
        console.error("Error submitting order:", err);
        showToast("Failed to submit order. Please try again.");
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(msg) {
    const toast = document.getElementById('global-toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    }, 3000);
}
