import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, runTransaction, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAwEcC_7ecjMxOdLJzT4cWnklapNSMMQjo",
    authDomain: "yam-stores.firebaseapp.com",
    databaseURL: "https://yam-stores-default-rtdb.firebaseio.com",
    projectId: "yam-stores",
    storageBucket: "yam-stores.firebasestorage.app",
    messagingSenderId: "337730969665",
    appId: "1:337730969665:web:dd865104af15846291a6c0",
    measurementId: "G-334MVEF7CR"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let allCarsData = {};
let currentCategory = 'used';
let currentCarImages = [];
let currentImageIdx = 0;
let activeStoreData = null;
let activeStoreIdKey = null;

window.addEventListener('DOMContentLoaded', () => {
    checkSiteMaintenance();
    fetchPublicCars();
    recordSiteVisit();
});

function recordSiteVisit() {
    const visitedKey = "yam_visited_session";
    if (!sessionStorage.getItem(visitedKey)) {
        sessionStorage.setItem(visitedKey, "true");
        const visitsRef = ref(db, 'statistics/totalVisits');
        runTransaction(visitsRef, (currentVal) => (currentVal || 0) + 1).catch(err => {});
        
        const todayRef = ref(db, 'statistics/todayVisits');
        runTransaction(todayRef, (currentVal) => (currentVal || 0) + 1).catch(err => {});
    }
}

function checkSiteMaintenance() {
    onValue(ref(db, 'settings/maintenance'), (snap) => {
        if (snap.val() === true) document.getElementById('maintenance-screen').classList.remove('hidden');
    });
}

function fetchPublicCars() {
    onValue(ref(db, 'products'), (snap) => {
        allCarsData = snap.val() || {};
        renderCarsList();
    });
}

window.switchView = function(viewName) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-gallery').classList.add('hidden');
    document.getElementById('view-request').classList.add('hidden');
    document.getElementById('view-services').classList.add('hidden');
    document.getElementById('view-store-profile').classList.add('hidden');
    document.getElementById('view-product-profile').classList.add('hidden');

    if (viewName === 'home') document.getElementById('view-home').classList.remove('hidden');
    if (viewName === 'gallery') document.getElementById('view-gallery').classList.remove('hidden');
    if (viewName === 'request') document.getElementById('view-request').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.selectCategory = function(cat) {
    currentCategory = cat;
    document.getElementById('gallery-title').textContent = cat === 'used' ? 'قسم السيارات المستعملة' : 'قسم السيارات الجديدة (وكالة)';
    document.getElementById('filter-container').classList.add('hidden');
    document.getElementById('filter-btn-text').textContent = 'فلترة متقدمة';
    switchView('gallery');
    renderCarsList();
};

window.toggleFilterBox = function() {
    const filterBox = document.getElementById('filter-container');
    const btnText = document.getElementById('filter-btn-text');
    if (filterBox.classList.contains('hidden')) {
        filterBox.classList.remove('hidden');
        btnText.textContent = 'إخفاء الفلترة';
    } else {
        filterBox.classList.add('hidden');
        btnText.textContent = 'فلترة متقدمة';
    }
};

window.applyFilters = function() { renderCarsList(); };

function renderCarsList() {
    const container = document.getElementById('cars-list-container');
    const brandFilter = document.getElementById('filter-brand').value.toLowerCase();
    const searchFilter = document.getElementById('filter-search').value.toLowerCase();
    const sortOrder = document.getElementById('filter-sort').value;

    let keys = Object.keys(allCarsData).filter(k => {
        const car = allCarsData[k];
        if (car.approved !== true) return false;
        if (car.marketType !== currentCategory) return false;
        
        const titleLower = (car.title || '').toLowerCase();
        if (brandFilter && !titleLower.includes(brandFilter)) return false;
        if (searchFilter && !titleLower.includes(searchFilter)) return false;
        return true;
    });

    keys.sort((a, b) => {
        const priceA = Number(allCarsData[a].price || 0);
        const priceB = Number(allCarsData[b].price || 0);
        if (sortOrder === 'high-to-low') return priceB - priceA;
        if (sortOrder === 'low-to-high') return priceA - priceB;
        return 0;
    });

    if (keys.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 card-box rounded-2xl space-y-3 border gold-border">
                <div class="text-[#d4af37] text-3xl"><i class="fa-solid fa-car"></i></div>
                <p class="text-neutral-400 text-xs">لا توجد سيارات مطابقة لبحثك في هذا القسم حالياً.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = keys.map(k => {
        const car = allCarsData[k];
        const img = car.images?.[0] || 'https://placehold.co/400x300';
        const isSold = car.statusTag === 'مباعة';
        return `
            <div class="card-box rounded-2xl p-3 flex items-center justify-between gap-3 cursor-pointer group relative border gold-border" onclick="openDetails('${k}')">
                <div class="relative w-36 sm:w-40 h-28 sm:h-32 rounded-xl overflow-hidden bg-black shrink-0 border gold-border order-1">
                    <img src="${img}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-2 right-2 px-2 py-0.5 ${isSold ? 'bg-red-600 text-white' : 'bg-[#d4af37] text-black'} text-[9px] font-black rounded-md shadow">
                        ${car.statusTag || 'متوفرة'}
                    </span>
                </div>

                <div class="flex-1 space-y-1.5 w-full text-right order-2">
                    <span class="text-[9px] gold-text font-mono">SA-${k.substring(0, 8)}</span>
                    <h3 class="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">${car.title}</h3>
                    
                    <div class="flex items-center gap-3 text-[10px] text-neutral-400 font-mono pt-0.5">
                        <div><i class="fa-solid fa-gauge text-[#d4af37] ml-1"></i> ${car.mileage || 'وكالة'}</div>
                        <div><i class="fa-solid fa-calendar-days text-[#d4af37] ml-1"></i> ${car.year || '2026'}</div>
                    </div>

                    <div class="flex items-center justify-between pt-1 border-t gold-border mt-1">
                        <div>
                            <span class="text-[9px] text-neutral-400 block">السعر النهائي</span>
                            <span class="text-sm sm:text-base font-black font-mono gold-text">${Number(car.price || 0).toLocaleString()} <span class="text-[10px] font-normal text-neutral-400">رس</span></span>
                        </div>
                        <div class="px-3 py-1.5 rounded-xl bg-[#d4af37]/10 border gold-border text-[11px] font-bold text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                            التفاصيل
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.openDetails = function(id) {
    const car = allCarsData[id];
    if (!car) return;

    currentCarImages = car.images && car.images.length > 0 ? car.images : ['https://placehold.co/600x400'];
    currentImageIdx = 0;
    updateMainImageDisplay();

    document.getElementById('d-title').textContent = car.title;
    document.getElementById('d-full-title').textContent = car.title;
    document.getElementById('d-tag').textContent = car.statusTag || 'متوفرة';
    document.getElementById('d-market-badge').textContent = car.marketType === 'new' ? 'السوق الجديد (وكالة)' : 'السوق المستعمل';
    document.getElementById('d-price').textContent = `${Number(car.price || 0).toLocaleString()} ﷼`;
    document.getElementById('d-mileage').textContent = car.mileage || 'وكالة';
    document.getElementById('d-engine').textContent = car.engineSize || 'غير متوفر';
    document.getElementById('d-hp').textContent = car.horsepower || 'غير متوفر';
    document.getElementById('d-torque').textContent = car.torque || 'غير متوفر';
    document.getElementById('d-desc').textContent = car.description || 'لا توجد ملاحظات إضافية مسجلة لهذه السيارة.';

    const waText = encodeURIComponent(`السلام عليكم، أرغب الاستفسار عن هذه السيارة:%0A🚗 *${car.title}*%0A💰 السعر: ${Number(car.price || 0).toLocaleString()} ريال`);
    document.getElementById('d-whatsapp-btn').href = `https://wa.me/966554082283?text=${waText}`;

    renderSimilarCars(id);
    document.getElementById('details-modal').classList.remove('hidden');
};

function updateMainImageDisplay() {
    document.getElementById('d-main-img').src = currentCarImages[currentImageIdx];
    const thumbContainer = document.getElementById('img-thumbnails');
    
    if (currentCarImages.length > 1) {
        thumbContainer.innerHTML = currentCarImages.map((imgUrl, idx) => `
            <div onclick="setImgIndex(${idx})" class="w-14 h-12 rounded-lg overflow-hidden border ${idx === currentImageIdx ? 'border-[#d4af37] opacity-100' : 'border-neutral-800 opacity-60'} cursor-pointer shrink-0 bg-black">
                <img src="${imgUrl}" class="w-full h-full object-cover">
            </div>
        `).join('');
    } else {
        thumbContainer.innerHTML = '';
    }
}

window.setImgIndex = function(idx) { currentImageIdx = idx; updateMainImageDisplay(); };
window.nextImage = function() { currentImageIdx = (currentImageIdx + 1) % currentCarImages.length; updateMainImageDisplay(); };
window.prevImage = function() { currentImageIdx = (currentImageIdx - 1 + currentCarImages.length) % currentCarImages.length; updateMainImageDisplay(); };
window.openFullscreenImg = function() { document.getElementById('lightbox-img').src = currentCarImages[currentImageIdx]; document.getElementById('lightbox-modal').classList.remove('hidden'); };
window.closeFullscreenImg = function() { document.getElementById('lightbox-modal').classList.add('hidden'); };
window.closeDetailsModal = () => document.getElementById('details-modal').classList.add('hidden');

function renderSimilarCars(excludeId) {
    const container = document.getElementById('similar-cars-grid');
    const keys = Object.keys(allCarsData).filter(k => k !== excludeId && allCarsData[k].approved === true).slice(0, 4);

    if (keys.length === 0) {
        container.innerHTML = '<p class="text-xs text-neutral-500 col-span-2 text-center">لا توجد سيارات أخرى حالياً.</p>';
        return;
    }

    container.innerHTML = keys.map(k => {
        const c = allCarsData[k];
        const img = c.images?.[0] || 'https://placehold.co/300x200';
        return `
            <div onclick="openDetails('${k}')" class="card-box p-2 rounded-xl border gold-border cursor-pointer group">
                <img src="${img}" class="w-full h-24 object-cover rounded-lg mb-2">
                <h5 class="text-xs font-bold text-white group-hover:text-amber-300 line-clamp-1">${c.title}</h5>
                <span class="text-[11px] font-mono gold-text font-bold">${Number(c.price || 0).toLocaleString()} ﷼</span>
            </div>
        `;
    }).join('');
}

window.openServicesView = async function() {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-gallery').classList.add('hidden');
    document.getElementById('view-request').classList.add('hidden');
    document.getElementById('view-store-profile').classList.add('hidden');
    document.getElementById('view-product-profile').classList.add('hidden');
    document.getElementById('view-services').classList.remove('hidden');

    const grid = document.getElementById('stores-grid-container');
    grid.innerHTML = '<p class="text-center text-neutral-500 col-span-full py-12">جاري تحميل شركاء YAM...</p>';

    try {
        const snap = await get(ref(db, 'services'));
        if (snap.exists()) {
            grid.innerHTML = '';
            snap.forEach((childSnap) => {
                const store = childSnap.val();
                const storeId = childSnap.key;
                
                grid.innerHTML += `
                    <div onclick="openStoreProfile('${storeId}')" class="card-box rounded-2xl overflow-hidden border gold-border cursor-pointer hover:border-[#d4af37] transition-all group">
                        <div class="h-48 overflow-hidden relative bg-black">
                            <img src="${store.image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                            <span class="absolute top-2 right-2 px-2.5 py-1 bg-[#d4af37] text-black text-[10px] font-bold rounded-lg shadow">
                                ${store.location || 'الرياض'}
                            </span>
                        </div>
                        <div class="p-4 space-y-2">
                            <h3 class="font-black text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">${store.name}</h3>
                            <p class="text-xs text-neutral-400 line-clamp-2">${store.description || 'شريك معتمد لتقديم أفضل الخدمات'}</p>
                            <div class="pt-2 border-t gold-border flex items-center justify-between text-xs">
                                <span class="gold-text font-bold">عرض المتجر والمنتجات</span>
                                <i class="fa-solid fa-arrow-left text-[#d4af37]"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            grid.innerHTML = '<p class="text-center text-neutral-500 col-span-full py-12">لا توجد شركاء مسجلين حالياً.</p>';
        }
    } catch(e) {
        grid.innerHTML = '<p class="text-center text-red-400 col-span-full py-12">حدث خطأ في تحميل البيانات.</p>';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openStoreProfile = async function(storeId) {
    activeStoreIdKey = storeId;
    document.getElementById('view-services').classList.add('hidden');
    document.getElementById('view-store-profile').classList.remove('hidden');

    try {
        const snap = await get(ref(db, `services/${storeId}`));
        if (snap.exists()) {
            activeStoreData = snap.val();
            document.getElementById('profile-store-name').textContent = activeStoreData.name;
            document.getElementById('profile-store-location').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${activeStoreData.location || 'المملكة العربية السعودية'}`;
            document.getElementById('profile-store-desc').textContent = activeStoreData.description || '';
            document.getElementById('profile-store-img').src = activeStoreData.image || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800';
            
            const phone = activeStoreData.phone ? activeStoreData.phone.replace(/[^0-9]/g, '') : '966554082283';
            document.getElementById('profile-store-whatsapp').href = `https://wa.me/${phone}?text=السلام%20عليكم،%20أرغب%20بالاستفسار%20عن%20خدماتكم`;

            renderStoreProductsGrid();
        }
    } catch(e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderStoreProductsGrid() {
    const prodGrid = document.getElementById('profile-products-grid');
    prodGrid.innerHTML = '';

    if (activeStoreData && activeStoreData.products) {
        Object.entries(activeStoreData.products).forEach(([pId, p]) => {
            prodGrid.innerHTML += `
                <div onclick="openProductProfile('${pId}')" class="card-box p-4 rounded-2xl border gold-border flex gap-4 items-center cursor-pointer group hover:border-[#d4af37] transition-all">
                    <img src="${p.image}" class="w-20 h-20 object-cover rounded-xl border gold-border shrink-0">
                    <div class="space-y-1 flex-1">
                        <h4 class="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">${p.title}</h4>
                        <p class="text-xs text-neutral-400 line-clamp-1">${p.description}</p>
                        <span class="text-xs font-mono font-bold gold-text block">${p.price}</span>
                    </div>
                </div>
            `;
        });
    } else {
        prodGrid.innerHTML = '<p class="text-xs text-neutral-500 col-span-2 text-center py-8">لا توجد منتجات أو عروض مضافة حالياً لهذا المتجر.</p>';
    }
}

window.openProductProfile = function(productId) {
    if (!activeStoreData || !activeStoreData.products || !activeStoreData.products[productId]) return;
    const p = activeStoreData.products[productId];

    document.getElementById('view-store-profile').classList.add('hidden');
    document.getElementById('view-product-profile').classList.remove('hidden');

    document.getElementById('prod-profile-img').src = p.image;
    document.getElementById('prod-profile-title').textContent = p.title;
    document.getElementById('prod-profile-price').textContent = p.price;
    document.getElementById('prod-profile-desc').textContent = p.description || 'لا توجد تفاصيل إضافية.';

    const phone = activeStoreData.phone ? activeStoreData.phone.replace(/[^0-9]/g, '') : '966554082283';
    const waText = encodeURIComponent(`السلام عليكم، أرغب الاستفسار عن هذا المنتج:%0A📦 *${p.title}*%0A💰 السعر: ${p.price}`);
    document.getElementById('prod-profile-whatsapp').href = `https://wa.me/${phone}?text=${waText}`;

    const otherGrid = document.getElementById('other-products-grid');
    otherGrid.innerHTML = '';
    let hasOther = false;

    Object.entries(activeStoreData.products).forEach(([otherId, otherP]) => {
        if (otherId !== productId) {
            hasOther = true;
            otherGrid.innerHTML += `
                <div onclick="openProductProfile('${otherId}')" class="card-box p-3 rounded-xl border gold-border flex gap-3 items-center cursor-pointer group">
                    <img src="${otherP.image}" class="w-14 h-14 object-cover rounded-lg border gold-border shrink-0">
                    <div class="space-y-0.5 flex-1">
                        <h5 class="font-bold text-xs text-white group-hover:text-amber-300 line-clamp-1">${otherP.title}</h5>
                        <span class="text-[11px] font-mono gold-text font-bold">${otherP.price}</span>
                    </div>
                </div>
            `;
        }
    });

    if (!hasOther) {
        otherGrid.innerHTML = '<p class="text-xs text-neutral-500 col-span-2 text-center py-4">لا توجد منتجات أخرى في هذا المتجر.</p>';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.backToStoreProfile = function() {
    document.getElementById('view-product-profile').classList.add('hidden');
    document.getElementById('view-store-profile').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.submitCustomRequest = function(e) {
    e.preventDefault();
    const brand = document.getElementById('req-brand-select').value;
    const name = document.getElementById('req-name').value;
    const phone = document.getElementById('req-phone').value;
    const msg = encodeURIComponent(`طلب سيارة غير متوفرة:\nالشركة: ${brand}\nالاسم: ${name}\nالجوال: ${phone}`);
    window.open(`https://wa.me/966554082283?text=${msg}`, '_blank');
};
