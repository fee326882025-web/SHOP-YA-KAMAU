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
firebase.initializeApp(firebaseConfig);
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
    bgUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80",
    adminPassword: "admin123"
};

let settings = DEFAULT_SETTINGS;
let products = [];
let orders = [];
let tempUploadedImages = [];

function formatMoney(amount) {
    const sym = settings.currency || 'KSh';
    return `${sym} ${parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function initAdminRealtime() {
    db.collection("store").doc("config").onSnapshot(doc => {
        if (doc.exists) {
            settings = doc.data();
            syncStoreData();
        }
    });

    db.collection("products").onSnapshot(snapshot => {
        products = [];
        snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
        if (document.getElementById('admin-products-grid') && !document.getElementById('admin-tab-products').classList.contains('hidden')) {
            renderAdminProducts();
        }
    });

    db.collection("orders").onSnapshot(snapshot => {
        orders = [];
        snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
        if (document.getElementById('admin-orders-table-body') && !document.getElementById('admin-tab-orders').classList.contains('hidden')) {
            renderAdminOrders();
        }
    });
}

window.onload = function() {
    initAdminRealtime();
    openAdminLoginModal();
};

function syncStoreData() {
    if (settings.bgUrl) {
        const viewEl = document.getElementById('admin-view');
        if (viewEl) viewEl.style.backgroundImage = `url('${settings.bgUrl}')`;
    }

    const storeNameEl = document.getElementById('setting-store-name');
    if (storeNameEl) {
        storeNameEl.value = settings.storeName || '';
        document.getElementById('setting-store-currency').value = settings.currency || 'KSh';
        document.getElementById('setting-store-phone').value = settings.phone || '';
        document.getElementById('setting-store-whatsapp').value = settings.whatsapp || '';
        document.getElementById('setting-store-instagram').value = settings.instagram || '';
        document.getElementById('setting-store-facebook').value = settings.facebook || '';
        document.getElementById('setting-store-location').value = settings.location || '';
        document.getElementById('setting-maps-url').value = settings.mapsUrl || '';
        document.getElementById('setting-delivery-fee').value = settings.deliveryFee || 0;
        
        const bgUrlInput = document.getElementById('setting-bg-url');
        if (bgUrlInput) {
            bgUrlInput.value = settings.bgUrl || '';
        }
    }
}

function handleCurrencySelect(selectEl) {
    if (selectEl.value !== 'custom') {
        document.getElementById('setting-store-currency').value = selectEl.value;
    }
}

function openAdminLoginModal() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
}

function toggleAdminLoginModal(open) {
    const modal = document.getElementById('admin-login-modal');
    if (open) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

function handleAdminLogin(e) {
    e.preventDefault();
    const inputPass = document.getElementById('admin-password-input').value;
    if (inputPass === settings.adminPassword) {
        toggleAdminLoginModal(false);
        document.getElementById('admin-password-input').value = '';
        switchAdminTab('orders');
        showToast("Welcome to Admin Control Center");
    } else {
        alert("Incorrect Security Password! Try default: admin123");
    }
}

function logoutAdmin() {
    window.location.href = 'index.html';
}

function switchAdminTab(tab) {
    document.getElementById('admin-tab-orders').classList.add('hidden');
    document.getElementById('admin-tab-products').classList.add('hidden');
    document.getElementById('admin-tab-settings').classList.add('hidden');

    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white');
        btn.classList.add('text-slate-400');
    });

    if (tab === 'orders') {
        document.getElementById('admin-tab-orders').classList.remove('hidden');
        document.getElementById('tab-btn-orders').classList.add('bg-brand-600', 'text-white');
        renderAdminOrders();
    } else if (tab === 'products') {
        document.getElementById('admin-tab-products').classList.remove('hidden');
        document.getElementById('tab-btn-products').classList.add('bg-brand-600', 'text-white');
        renderAdminProducts();
    } else if (tab === 'settings') {
        document.getElementById('admin-tab-settings').classList.remove('hidden');
        document.getElementById('tab-btn-settings').classList.add('bg-brand-600', 'text-white');
    }
}

function renderAdminOrders() {
    const tbody = document.getElementById('admin-orders-table-body');
    const emptyMsg = document.getElementById('no-orders-msg');

    const totalRev = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
    const pendingCount = orders.filter(o => o.status === 'Pending Delivery').length;
    const completedCount = orders.filter(o => o.status === 'Delivered').length;

    document.getElementById('stat-total-revenue').textContent = formatMoney(totalRev);
    document.getElementById('stat-pending-orders').textContent = pendingCount;
    document.getElementById('stat-completed-orders').textContent = completedCount;
    document.getElementById('admin-pending-count').textContent = pendingCount;

    if (orders.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');

    tbody.innerHTML = orders.map(order => `
        <tr class="hover:bg-slate-800/40 transition">
            <td class="py-3.5 px-4 font-mono">
                <span class="font-bold text-white block">${order.id}</span>
                <span class="text-[11px] text-amber-400">${order.dateTime}</span>
            </td>
            <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-200">${order.customerName}</div>
                <div class="text-xs text-slate-400">${order.customerPhone}</div>
                <div class="text-[11px] text-slate-500 truncate max-w-xs" title="${order.customerAddress}">${order.customerAddress}</div>
            </td>
            <td class="py-3.5 px-4">
                <div class="space-y-1">
                    ${order.items.map(i => `
                        <div class="flex items-center gap-2 text-xs text-slate-300">
                            <img src="${i.image}" class="w-7 h-7 object-cover rounded-md border border-slate-700">
                            <span>${i.qty}x ${i.title}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td class="py-3.5 px-4 font-bold text-white">
                ${formatMoney(order.total)}
            </td>
            <td class="py-3.5 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                    <span class="w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
                    ${order.status}
                </span>
            </td>
            <td class="py-3.5 px-4 text-right space-x-1">
                <button onclick="toggleOrderStatus('${order.id}')" title="Toggle Status" class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition">
                    <i class="fa-solid fa-arrows-rotate text-xs"></i>
                </button>
                <button onclick="printOrderReceipt('${order.id}')" title="Print Delivery Receipt" class="px-2.5 py-1.5 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white border border-brand-500/30 rounded-lg text-xs font-semibold transition">
                    <i class="fa-solid fa-print mr-1"></i> Receipt
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const newStatus = order.status === 'Pending Delivery' ? 'Delivered' : 'Pending Delivery';
        db.collection("orders").doc(orderId).update({ status: newStatus }).then(() => {
            showToast(`Order status updated to ${newStatus}`);
        });
    }
}

function printOrderReceipt(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('print-store-name').textContent = settings.storeName;
    document.getElementById('print-store-address').textContent = settings.location;
    document.getElementById('print-store-phone').textContent = `Phone: ${settings.phone} | WA: ${settings.whatsapp}`;
    
    document.getElementById('print-order-id').textContent = order.id;
    document.getElementById('print-order-date').textContent = order.dateTime;
    
    document.getElementById('print-cust-name').textContent = order.customerName;
    document.getElementById('print-cust-phone').textContent = order.customerPhone;
    document.getElementById('print-cust-address').textContent = order.customerAddress;
    document.getElementById('print-cust-time').textContent = order.deliveryTime;

    const itemsTbody = document.getElementById('print-items-body');
    itemsTbody.innerHTML = order.items.map(i => `
        <tr>
            <td class="py-2"><img src="${i.image}" class="w-10 h-10 object-cover rounded border border-slate-300"></td>
            <td class="py-2 font-medium">${i.title}</td>
            <td class="py-2 text-center">${i.qty}</td>
            <td class="py-2 text-right">${formatMoney(i.price)}</td>
            <td class="py-2 text-right">${formatMoney(i.price * i.qty)}</td>
        </tr>
    `).join('');

    document.getElementById('print-subtotal').textContent = formatMoney(order.subtotal);
    document.getElementById('print-delivery').textContent = formatMoney(order.deliveryFee);
    document.getElementById('print-total').textContent = formatMoney(order.total);

    window.print();
}

function exportOrdersToExcel() {
    if (orders.length === 0) {
        alert("No orders available to export.");
        return;
    }
    const excelData = orders.map(o => ({
        "Order ID": o.id,
        "Date & Time (Nairobi EAT)": o.dateTime,
        "Customer Name": o.customerName,
        "Phone Number": o.customerPhone,
        "Delivery Address": o.customerAddress,
        "Requested Time": o.deliveryTime,
        "Contact Channel": o.contactChannel,
        "Items Ordered": o.items.map(i => `${i.qty}x ${i.title}`).join('; '),
        "Subtotal": o.subtotal,
        "Delivery Fee": o.deliveryFee,
        "Total Amount": o.total,
        "Status": o.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Shop_Ya_Kamau_Orders_${Date.now()}.xlsx`);
    showToast("Excel spreadsheet generated!");
}

function exportOrdersToCSV() {
    if (orders.length === 0) {
        alert("No orders available to export.");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Date & Time (EAT),Customer Name,Phone,Delivery Address,Items,Total,Status\n";
    orders.forEach(o => {
        const itemsStr = o.items.map(i => `${i.qty}x ${i.title}`).join('; ');
        csvContent += `"${o.id}","${o.dateTime}","${o.customerName}","${o.customerPhone}","${o.customerAddress}","${itemsStr}","${o.total}","${o.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Shop_Ya_Kamau_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV spreadsheet exported!");
}

function renderAdminProducts() {
    const grid = document.getElementById('admin-products-grid');
    grid.innerHTML = products.map(product => {
        const imgList = (product.images && product.images.length > 0) ? product.images : [product.image || 'https://placehold.co/600x400/0ea5e9/ffffff?text=Product'];
        return `
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                <div class="h-44 overflow-hidden bg-slate-950 relative">
                    <img src="${imgList[0]}" alt="${product.title}" class="w-full h-full object-cover">
                    <span class="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border border-slate-700">${product.category}</span>
                    <span class="absolute bottom-2 right-2 bg-slate-900/90 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800"><i class="fa-solid fa-images mr-1"></i>${imgList.length} Photos</span>
                </div>
                <div class="flex items-center gap-1.5 p-2 bg-slate-950/60 border-t border-b border-slate-800 overflow-x-auto">
                    ${imgList.map(img => `<img src="${img}" class="w-8 h-8 object-cover rounded-md border border-slate-800">`).join('')}
                </div>
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start gap-2">
                            <h4 class="font-bold text-white text-sm leading-snug">${product.title}</h4>
                            <span class="text-sm font-extrabold text-brand-400">${formatMoney(product.price)}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1 line-clamp-2">${product.description}</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                        <button onclick="editProduct('${product.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit</button>
                        <button onclick="deleteProduct('${product.id}')" class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium rounded-lg transition"><i class="fa-solid fa-trash mr-1"></i> Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const titleEl = document.getElementById('product-modal-title');
    const container = document.getElementById('photo-urls-container');
    container.innerHTML = '';
    tempUploadedImages = [];

    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-title').value = product.title;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-category').value = product.category;
            document.getElementById('prod-desc').value = product.description;

            const existingImgs = (product.images && product.images.length > 0) ? product.images : [product.image];
            existingImgs.forEach(url => addPhotoUrlInput(url));
            titleEl.textContent = "Edit Product & Photos";
        }
    } else {
        document.getElementById('product-form').reset();
        document.getElementById('prod-id').value = '';
        addPhotoUrlInput();
        titleEl.textContent = "Add New Product (Multi-Photo)";
    }
    modal.classList.remove('hidden');
}

function addPhotoUrlInput(value = '') {
    const container = document.getElementById('photo-urls-container');
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2';
    div.innerHTML = `
        <input type="text" value="${value}" placeholder="Photo URL (e.g. https://... .jpg)" class="prod-url-input w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500">
        <button type="button" onclick="this.parentElement.remove()" class="text-slate-500 hover:text-red-400 text-xs px-2 py-1"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(div);
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value || 'prod_' + Date.now();
    const title = document.getElementById('prod-title').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value;
    const description = document.getElementById('prod-desc').value;

    const urlInputs = Array.from(document.querySelectorAll('.prod-url-input')).map(i => i.value.trim()).filter(val => val !== '');
    const allImages = [...urlInputs, ...tempUploadedImages];
    if (allImages.length === 0) allImages.push('https://placehold.co/600x400/0ea5e9/ffffff?text=Product');

    db.collection("products").doc(id).set({
        title, price, category, images: allImages, image: allImages[0], description
    }).then(() => {
        closeProductModal();
        showToast("Product saved to cloud instantly!");
    });
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        db.collection("products").doc(id).delete().then(() => {
            showToast("Product removed from live store");
        });
    }
}

function saveAdminSettings(e) {
    e.preventDefault();
    settings.storeName = document.getElementById('setting-store-name').value;
    settings.currency = document.getElementById('setting-store-currency').value || 'KSh';
    settings.phone = document.getElementById('setting-store-phone').value;
    settings.whatsapp = document.getElementById('setting-store-whatsapp').value;
    settings.instagram = document.getElementById('setting-store-instagram').value;
    settings.facebook = document.getElementById('setting-store-facebook').value;
    settings.location = document.getElementById('setting-store-location').value;
    settings.mapsUrl = document.getElementById('setting-maps-url').value;
    settings.deliveryFee = parseFloat(document.getElementById('setting-delivery-fee').value) || 0;

    const bgUrlInput = document.getElementById('setting-bg-url').value;
    if (bgUrlInput) settings.bgUrl = bgUrlInput;

    db.collection("store").doc("config").set(settings).then(() => {
        showToast("Settings updated in cloud!");
    });
}

function openChangePasswordModal() {
    document.getElementById('change-pass-modal').classList.remove('hidden');
}

function toggleChangePassModal(open) {
    const modal = document.getElementById('change-pass-modal');
    if (open) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
}

function handleChangePassword(e) {
    e.preventDefault();
    const oldP = document.getElementById('old-pass').value;
    const newP = document.getElementById('new-pass').value;

    if (oldP !== settings.adminPassword) {
        alert("Current password is invalid.");
        return;
    }

    settings.adminPassword = newP;
    db.collection("store").doc("config").set(settings).then(() => {
        toggleChangePassModal(false);
        document.getElementById('old-pass').value = '';
        document.getElementById('new-pass').value = '';
        showToast("Master Security Password updated!");
    });
}

function showToast(msg) {
    const toast = document.getElementById('global-toast');
    document.getElementById('toast-message').textContent = msg;
    toast.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
    }, 3000);
}
