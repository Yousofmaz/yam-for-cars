// ==========================================
// YAM FOR CARS - MAIN SCRIPT
// =================0=========================

// مصفوفة تخزين بيانات السيارات (يمكنك ربطها بقاعدة بياناتك أو جلبها من API لاحقاً)
window.carsData = [
    {
        id: "1",
        category: "used",
        brand: "مرسيدس بنز",
        name: "مرسيدس S-Class 2024",
        price: "450000",
        mileage: "15,000 كم",
        engine: "8 سلندر توربو",
        hp: "500 حصان",
        torque: "700 نيوتن متر",
        description: "سيارة بحالة الوكالة تماماً، صيانة دورية بالوكالة، فل كامل مع كافة المواصفات الفاخرة.",
        images: [
            "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "2",
        category: "new",
        brand: "بي إم دبليو",
        name: "بي إم دبليو الفئة السابعة 2025",
        price: "520000",
        mileage: "جديد (وكالة)",
        engine: "6 سلندر تيربو",
        hp: "380 حصان",
        torque: "540 نيوتن متر",
        description: "وارد وكالة جديد بطاقة جمركية، لون مميز، ضمان أوربي ومحلي.",
        images: [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        id: "3",
        category: "used",
        brand: "بورش",
        name: "بورش كايين توربو 2023",
        price: "390000",
        mileage: "28,000 كم",
        engine: "V8 ثنائي التيربو",
        hp: "541 حصان",
        torque: "770 نيوتن متر",
        description: "حالة نظيفة جداً، حماية صبغ كامل، بانوراما، داخلية جلد أحمر فاخر.",
        images: [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
        ]
    }
];

// المتغيرات العامة للحالة
let currentCategory = 'used';
let currentCarData = null;
let currentImageIndex = 0;

// عند تحميل الصفحة بالكامل
window.addEventListener('DOMContentLoaded', () => {
    // تشغيل فحص الرابط المباشر (Deep Linking للسيارات)
    setTimeout(checkUrlForCar, 300);
});

// التبديل بين واجهات الموقع (Single Page Application Views)
window.switchView = function(viewName) {
    const views = ['view-home', 'view-gallery', 'view-services', 'view-store-profile', 'view-product-profile', 'view-request'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    if (viewName === 'home') {
        document.getElementById('view-home').classList.remove('hidden');
    } else if (viewName === 'gallery') {
        document.getElementById('view-gallery').classList.remove('hidden');
        renderCars();
    } else if (viewName === 'request') {
        document.getElementById('view-request').classList.remove('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// اختيار القسم (مستعمل / جديد)
window.selectCategory = function(category) {
    currentCategory = category;
    const titleEl = document.getElementById('gallery-title');
    if (titleEl) {
        titleEl.innerText = category === 'used' ? 'السيارات المستعملة بحالة الوكالة' : 'السيارات الجديدة (وكالة)';
    }
    switchView('gallery');
};

// عرض وتصفية السيارات
window.renderCars = function() {
    const container = document.getElementById('cars-list-container');
    if (!container) return;

    const brandFilter = document.getElementById('filter-brand')?.value || '';
    const searchFilter = document.getElementById('filter-search')?.value.toLowerCase() || '';
    const sortFilter = document.getElementById('filter-sort')?.value || 'default';

    let filtered = window.carsData.filter(car => {
        const matchCategory = car.category === currentCategory;
        const matchBrand = brandFilter === '' || car.brand === brandFilter;
        const matchSearch = car.name.toLowerCase().includes(searchFilter) || car.description.toLowerCase().includes(searchFilter);
        return matchCategory && matchBrand && matchSearch;
    });

    // ترتيب الأسعار
    if (sortFilter === 'high-to-low') {
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortFilter === 'low-to-high') {
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="card-box rounded-2xl p-6 text-center text-neutral-400 border gold-border">لا توجد سيارات مطابقة لبحثك حالياً.</div>`;
        return;
    }

    container.innerHTML = filtered.map(car => `
        <div class="card-box p-4 rounded-2xl border gold-border flex flex-col sm:flex-row gap-4 items-center justify-between hover:border-amber-400 transition-all cursor-pointer" onclick='openDetailsModal(${JSON.stringify(car)})'>
            <div class="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black shrink-0 border gold-border">
                <img src="${car.images[0]}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 space-y-1.5 text-right w-full">
                <span class="text-[10px] gold-text font-mono">${car.brand}</span>
                <h3 class="text-sm font-black text-white">${car.name}</h3>
                <p class="text-xs text-neutral-400 line-clamp-1">${car.description}</p>
                <div class="flex items-center gap-3 pt-1 text-[11px] font-mono text-neutral-300">
                    <span><i class="fa-solid fa-gauge text-amber-400"></i> ${car.mileage}</span>
                    <span><i class="fa-solid fa-car text-amber-400"></i> ${car.engine}</span>
                </div>
            </div>
            <div class="text-left w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end shrink-0">
                <span class="text-base font-black font-mono gold-text">${car.price ? car.price + ' ﷼' : 'عند الاتصال'}</span>
                <button class="mt-2 px-3.5 py-2 bg-[#d4af37] text-black font-black text-xs rounded-xl shadow hover:opacity-90 transition-all">
                    التفاصيل
                </button>
            </div>
        </div>
    `).join('');
};

window.applyFilters = function() {
    renderCars();
};

window.toggleFilterBox = function() {
    const box = document.getElementById('filter-container');
    if (box) box.classList.toggle('hidden');
};

// فتح نافذة تفاصيل السيارة وتحديث الـ URL والواتساب
window.openDetailsModal = function(car) {
    currentCarData = car;
    currentImageIndex = 0;
    
    document.getElementById('d-title').innerText = car.name || 'تفاصيل السيارة';
    document.getElementById('d-full-title').innerText = car.name || '--';
    document.getElementById('d-price').innerText = car.price ? `${car.price} ﷼` : 'عند الاتصال';
    document.getElementById('d-mileage').innerText = car.mileage || 'جديد';
    document.getElementById('d-engine').innerText = car.engine || '--';
    document.getElementById('d-hp').innerText = car.hp || '--';
    document.getElementById('d-torque').innerText = car.torque || '--';
    document.getElementById('d-desc').innerText = car.description || 'لا يوجد وصف إضافي.';
    
    // عرض الصور المصغرة والرئيسية
    updateCarImages(car.images);
    
    // إنشاء رابط فريد ومستقل للسيارة
    const carUrl = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(car.id)}`;
    
    // تحديث شريط عنوان المتصفح بدون إعادة تحميل الصفحة
    window.history.pushState({ carId: car.id }, '', carUrl);

    // تجهيز رسالة الواتساب اللطيفة التي تحتوي على رابط السيارة المباشر
    const whatsappMsg = `أهلاً وسهلاً بك في *YAM FOR CARS* 🏎️✨

يسعدنا استفسارك عن السيارة التالية:
📌 *السيارة:* ${car.name}
💰 *السعر:* ${car.price ? car.price + ' ﷼' : 'عند الاتصال'}

🔗 *رابط المعاينة والتفاصيل:*
${carUrl}

يرجى تزويدنا باستفسارك أو تحديد الموعد المناسب لمعاينة السيارة!`;

    const whatsappBtn = document.getElementById('d-whatsapp-btn');
    const phone = '966554082283'; // رقم الواتساب الخاص بالمعرض
    whatsappBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`;

    // عرض السيارات المشابهة
    renderSimilarCars(car);

    // إظهار نافذة التفاصيل
    document.getElementById('details-modal').classList.remove('hidden');
};

function updateCarImages(images) {
    const mainImg = document.getElementById('d-main-img');
    const thumbsContainer = document.getElementById('img-thumbnails');
    
    if (images && images.length > 0) {
        mainImg.src = images[currentImageIndex];
        thumbsContainer.innerHTML = images.map((img, idx) => `
            <img src="${img}" onclick="setMainImage(${idx})" class="w-16 h-12 object-cover rounded-lg cursor-pointer border ${idx === currentImageIndex ? 'border-amber-400 opacity-100' : 'border-neutral-700 opacity-60'} hover:opacity-100 transition-all">
        `).join('');
    }
}

window.setMainImage = function(idx) {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = idx;
        document.getElementById('d-main-img').src = currentCarData.images[currentImageIndex];
        updateCarImages(currentCarData.images);
    }
};

window.nextImage = function() {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = (currentImageIndex + 1) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
};

window.prevImage = function() {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = (currentImageIndex - 1 + currentCarData.images.length) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
};

function renderSimilarCars(car) {
    const grid = document.getElementById('similar-cars-grid');
    if (!grid) return;
    
    const similar = window.carsData.filter(c => c.id !== car.id && c.category === car.category).slice(0, 2);
    
    if (similar.length === 0) {
        grid.innerHTML = `<span class="text-xs text-neutral-500 col-span-2">لا توجد سيارات مشابهة حالياً.</span>`;
        return;
    }

    grid.innerHTML = similar.map(sim => `
        <div onclick='openDetailsModal(${JSON.stringify(sim)})' class="card-box p-2.5 rounded-xl border gold-border cursor-pointer space-y-1 hover:border-amber-400 transition-all">
            <img src="${sim.images[0]}" class="w-full h-24 object-cover rounded-lg">
            <h5 class="text-[11px] font-bold text-white truncate">${sim.name}</h5>
            <span class="text-[10px] font-mono gold-text block">${sim.price ? sim.price + ' ﷼' : 'عند الاتصال'}</span>
        </div>
    `).join('');
}

// دالة إغلاق نافذة التفاصيل وإعادة الـ URL للوضع الطبيعي
window.closeDetailsModal = function() {
    document.getElementById('details-modal').classList.add('hidden');
    window.history.pushState({}, '', window.location.pathname);
};

// دالة نسخ رابط السيارة المباشر
window.copyCarLink = function() {
    if (!currentCarData) return;
    
    const carUrl = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(currentCarData.id)}`;
    
    navigator.clipboard.writeText(carUrl).then(() => {
        alert('✨ تم نسخ رابط السيارة بنجاح! يمكنك الآن مشاركته في أي مكان.');
    }).catch(err => {
        console.error('فشل نسخ الرابط:', err);
    });
};

// فحص الروابط عند الدخول المباشر (Deep Linking)
function checkUrlForCar() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car');
    
    if (carId && window.carsData) {
        const targetCar = window.carsData.find(c => String(c.id) === String(carId));
        if (targetCar) {
            openDetailsModal(targetCar);
        }
    }
}

// دعم زر الرجوع في المتصفح لإغلاق النافذة بسلاسة
window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('car')) {
        document.getElementById('details-modal').classList.add('hidden');
    }
});

// إرسال طلب سيارة غير متوفرة عبر الواتساب
window.submitCustomRequest = function(event) {
    event.preventDefault();
    const brand = document.getElementById('req-brand-select').value;
    const carName = document.getElementById('req-car-name').value;
    const carClass = document.getElementById('req-class').value;
    const name = document.getElementById('req-name').value;
    const phone = document.getElementById('req-phone').value;

    const msg = `طلب توفير سيارة جديدة 📋✨\n\n- الشركة: ${brand}\n- السيارة والموديل: ${carName}\n- الفئة: ${carClass}\n- اسم العميل: ${name}\n- الجوال: ${phone}`;
    
    const adminPhone = '966554082283';
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

// شركاء YAM (دليل المراكز)
window.openServicesView = function() {
    switchView('services');
    const container = document.getElementById('stores-grid-container');
    if (!container) return;

    // مثال لشركاء المعرض
    const stores = [
        {
            id: 'store-1',
            name: 'مركز العناية الفاخرة للسيارات',
            location: 'الرياض - الدائري الشمالي',
            description: 'نقدم خدمات حماية النانو سيراميك وتظليل عازل حراري بأعلى معايير الجودة.',
            image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
            whatsapp: '966554082283'
        }
    ];

    container.innerHTML = stores.map(store => `
        <div class="card-box p-5 rounded-2xl border gold-border space-y-4 text-center">
            <img src="${store.image}" class="w-20 h-20 object-cover rounded-2xl mx-auto border gold-border">
            <h3 class="text-base font-black text-amber-300">${store.name}</h3>
            <p class="text-[11px] text-neutral-400"><i class="fa-solid fa-location-dot"></i> ${store.location}</p>
            <p class="text-xs text-neutral-300">${store.description}</p>
            <a href="https://wa.me/${store.whatsapp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن خدماتكم عبر شريك YAM')}" target="_blank" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                <i class="fa-brands fa-whatsapp"></i> تواصل مع الشريك
            </a>
        </div>
    `).join('');
};
