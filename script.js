// ==========================================
// YAM FOR CARS - MAIN SCRIPT
// ==========================================

// بيانات السيارات المتوفرة
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

// المتغيرات العامة
var currentCategory = 'used';
var currentCarData = null;
var currentImageIndex = 0;

// التنقل بين الشاشات
function switchView(viewName, pushState = true) {
    var views = ['view-home', 'view-gallery', 'view-car-details', 'view-services', 'view-request'];
    views.forEach(function(v) {
        var el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    var targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.remove('hidden');

    if (viewName === 'gallery') {
        renderCars();
    }

    if (pushState && viewName !== 'car-details') {
        window.history.pushState({ view: viewName }, '', window.location.pathname);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// اختيار القسم (مستعمل / جديد)
function selectCategory(category) {
    currentCategory = category;
    var titleEl = document.getElementById('gallery-title');
    if (titleEl) {
        titleEl.innerText = category === 'used' ? 'السيارات المستعملة بحالة الوكالة' : 'السيارات الجديدة (وكالة)';
    }
    switchView('gallery');
}

// عرض السيارات بتصميم أفقـي مستطيل ومريح
function renderCars() {
    var container = document.getElementById('cars-list-container');
    if (!container) return;

    var brandFilter = document.getElementById('filter-brand') ? document.getElementById('filter-brand').value : '';
    var searchFilter = document.getElementById('filter-search') ? document.getElementById('filter-search').value.toLowerCase() : '';
    var sortFilter = document.getElementById('filter-sort') ? document.getElementById('filter-sort').value : 'default';

    var filtered = window.carsData.filter(function(car) {
        var matchCategory = car.category === currentCategory;
        var matchBrand = brandFilter === '' || car.brand === brandFilter;
        var matchSearch = car.name.toLowerCase().indexOf(searchFilter) !== -1 || car.description.toLowerCase().indexOf(searchFilter) !== -1;
        return matchCategory && matchBrand && matchSearch;
    });

    if (sortFilter === 'high-to-low') {
        filtered.sort(function(a, b) { return Number(b.price) - Number(a.price); });
    } else if (sortFilter === 'low-to-high') {
        filtered.sort(function(a, b) { return Number(a.price) - Number(b.price); });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="card-box rounded-2xl p-8 text-center text-neutral-400 border gold-border">لا توجد سيارات مطابقة لبحثك حالياً.</div>';
        return;
    }

    container.innerHTML = filtered.map(function(car) {
        return `
            <div class="card-box rounded-2xl border gold-border p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-center group hover:border-[#d4af37] transition-all cursor-pointer shadow-lg" onclick="goToCarDetails('${car.id}')">
                
                <!-- صورة السيارة أفقية ومستطيلة -->
                <div class="w-full sm:w-60 h-40 sm:h-36 rounded-xl overflow-hidden bg-black shrink-0 relative border gold-border">
                    <img src="${car.images[0]}" alt="${car.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-2 right-2 px-2 py-0.5 bg-black/80 text-amber-300 border gold-border text-[10px] font-bold rounded-md">
                        ${car.category === 'used' ? 'مستعمل' : 'جديد'}
                    </span>
                </div>

                <!-- تفاصيل السيارة الوسطية -->
                <div class="flex-1 space-y-2 w-full text-right">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[10px] gold-text font-mono font-bold block">${car.brand}</span>
                            <h3 class="text-base font-black text-white group-hover:text-amber-300 transition-colors">${car.name}</h3>
                        </div>
                    </div>
                    
                    <p class="text-xs text-neutral-400 line-clamp-2 leading-relaxed">${car.description}</p>
                    
                    <div class="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-neutral-300">
                        <span class="bg-neutral-900/80 px-2 py-1 rounded-lg border border-neutral-800"><i class="fa-solid fa-gauge text-amber-400 ml-1"></i> ${car.mileage}</span>
                        <span class="bg-neutral-900/80 px-2 py-1 rounded-lg border border-neutral-800"><i class="fa-solid fa-car text-amber-400 ml-1"></i> ${car.engine}</span>
                        <span class="bg-neutral-900/80 px-2 py-1 rounded-lg border border-neutral-800"><i class="fa-solid fa-bolt text-amber-400 ml-1"></i> ${car.hp}</span>
                    </div>
                </div>

                <!-- السعر وزر الانتقال -->
                <div class="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <div class="text-right sm:text-left">
                        <span class="text-xs text-neutral-400 block sm:hidden">السعر:</span>
                        <span class="text-base sm:text-lg font-black font-mono gold-text">${car.price ? car.price + ' ﷼' : 'عند الاتصال'}</span>
                    </div>
                    <button class="sm:mt-3 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black font-black text-xs rounded-xl shadow hover:opacity-90 transition-all flex items-center gap-1.5">
                        تفاصيل السيارة <i class="fa-solid fa-arrow-left text-[10px]"></i>
                    </button>
                </div>

            </div>
        `;
    }).join('');
}

// الانتقال إلى صفحة تفاصيل السيارة المخصصة (رابط مباشر بدون قلتشات)
function goToCarDetails(id) {
    var car = window.carsData.find(function(c) { return String(c.id) === String(id); });
    if (!car) return;

    currentCarData = car;
    currentImageIndex = 0;

    // تحديث بيانات صفحة التفاصيل
    document.getElementById('d-full-title').innerText = car.name || '--';
    document.getElementById('d-brand-badge').innerText = car.brand || '--';
    document.getElementById('d-price').innerText = car.price ? car.price + ' ﷼' : 'عند الاتصال';
    document.getElementById('d-mileage').innerText = car.mileage || 'جديد';
    document.getElementById('d-engine').innerText = car.engine || '--';
    document.getElementById('d-hp').innerText = car.hp || '--';
    document.getElementById('d-torque').innerText = car.torque || '--';
    document.getElementById('d-desc').innerText = car.description || 'لا يوجد وصف إضافي.';

    updateCarImages(car.images);

    // تغيير عنوان الـ URL بشكل نظيف
    var carUrl = window.location.origin + window.location.pathname + '?car=' + encodeURIComponent(car.id);
    window.history.pushState({ carId: car.id, view: 'car-details' }, '', carUrl);

    // تجهيز رسالة الواتساب
    var whatsappMsg = 'أهلاً وسهلاً بك في *YAM FOR CARS* 🏎️✨\n\n' +
                      'يسعدنا استفسارك عن السيارة التالية:\n' +
                      '📌 *السيارة:* ' + car.name + '\n' +
                      '💰 *السعر:* ' + (car.price ? car.price + ' ﷼' : 'عند الاتصال') + '\n\n' +
                      '🔗 *رابط المعاينة والتفاصيل:*\n' + carUrl + '\n\n' +
                      'يرجى تزويدنا باستفسارك أو تحديد الموعد المناسب لمعاينة السيارة!';

    var whatsappBtn = document.getElementById('d-whatsapp-btn');
    var phone = '966554082283';
    whatsappBtn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(whatsappMsg);

    renderSimilarCars(car);
    switchView('car-details', false);
}

function backToGallery() {
    switchView('gallery', true);
}

function updateCarImages(images) {
    var mainImg = document.getElementById('d-main-img');
    var thumbsContainer = document.getElementById('img-thumbnails');
    
    if (images && images.length > 0) {
        mainImg.src = images[currentImageIndex];
        thumbsContainer.innerHTML = images.map(function(img, idx) {
            return '<img src="' + img + '" onclick="setMainImage(' + idx + ')" class="w-16 h-12 object-cover rounded-lg cursor-pointer border ' + (idx === currentImageIndex ? 'border-amber-400 opacity-100' : 'border-neutral-700 opacity-60') + ' hover:opacity-100 transition-all">';
        }).join('');
    }
}

function setMainImage(idx) {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = idx;
        document.getElementById('d-main-img').src = currentCarData.images[currentImageIndex];
        updateCarImages(currentCarData.images);
    }
}

function nextImage() {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = (currentImageIndex + 1) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
}

function prevImage() {
    if (currentCarData && currentCarData.images) {
        currentImageIndex = (currentImageIndex - 1 + currentCarData.images.length) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
}

function openFullscreenImg() {
    var mainImgSrc = document.getElementById('d-main-img').src;
    if (mainImgSrc) {
        document.getElementById('lightbox-img').src = mainImgSrc;
        document.getElementById('lightbox-modal').classList.remove('hidden');
    }
}

function closeFullscreenImg() {
    document.getElementById('lightbox-modal').classList.add('hidden');
}

function renderSimilarCars(car) {
    var grid = document.getElementById('similar-cars-grid');
    if (!grid) return;
    
    var similar = window.carsData.filter(function(c) { return c.id !== car.id && c.category === car.category; }).slice(0, 2);
    
    if (similar.length === 0) {
        grid.innerHTML = '<span class="text-xs text-neutral-500 col-span-2">لا توجد سيارات مشابهة حالياً.</span>';
        return;
    }

    grid.innerHTML = similar.map(function(sim) {
        return `
            <div onclick="goToCarDetails('${sim.id}')" class="card-box p-3 rounded-xl border gold-border cursor-pointer flex items-center gap-3 hover:border-amber-400 transition-all">
                <img src="${sim.images[0]}" class="w-20 h-14 object-cover rounded-lg shrink-0">
                <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-white truncate">${sim.name}</h5>
                    <span class="text-[10px] font-mono gold-text block mt-1">${sim.price ? sim.price + ' ﷼' : 'عند الاتصال'}</span>
                </div>
            </div>
        `;
    }).join('');
}

function copyCarLink() {
    if (!currentCarData) return;
    var carUrl = window.location.origin + window.location.pathname + '?car=' + encodeURIComponent(currentCarData.id);
    
    navigator.clipboard.writeText(carUrl).then(function() {
        alert('✨ تم نسخ رابط السيارة بنجاح!');
    }).catch(function(err) {
        console.error('فشل النسخ:', err);
    });
}

function toggleFilterBox() {
    var box = document.getElementById('filter-container');
    if (box) box.classList.toggle('hidden');
}

function applyFilters() {
    renderCars();
}

function openServicesView() {
    switchView('services');
    var container = document.getElementById('stores-grid-container');
    if (!container) return;

    var stores = [
        {
            id: 'store-1',
            name: 'مركز العناية الفاخرة للسيارات',
            location: 'الرياض - الدائري الشمالي',
            description: 'نقدم خدمات حماية النانو سيراميك وتظليل عازل حراري بأعلى معايير الجودة.',
            image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
            whatsapp: '966554082283'
        }
    ];

    container.innerHTML = stores.map(function(store) {
        return `
            <div class="card-box p-5 rounded-2xl border gold-border space-y-4 text-center">
                <img src="${store.image}" class="w-20 h-20 object-cover rounded-2xl mx-auto border gold-border">
                <h3 class="text-base font-black text-amber-300">${store.name}</h3>
                <p class="text-[11px] text-neutral-400"><i class="fa-solid fa-location-dot"></i> ${store.location}</p>
                <p class="text-xs text-neutral-300">${store.description}</p>
                <a href="https://wa.me/${store.whatsapp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن خدماتكم عبر شريك YAM')}" target="_blank" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                    <i class="fa-brands fa-whatsapp"></i> تواصل مع الشريك
                </a>
            </div>
        `;
    }).join('');
}

function submitCustomRequest(event) {
    event.preventDefault();
    var brand = document.getElementById('req-brand-select').value;
    var carName = document.getElementById('req-car-name').value;
    var carClass = document.getElementById('req-class').value;
    var name = document.getElementById('req-name').value;
    var phone = document.getElementById('req-phone').value;

    var msg = 'طلب توفير سيارة جديدة 📋✨\n\n' +
              '- الشركة: ' + brand + '\n' +
              '- السيارة والموديل: ' + carName + '\n' +
              '- الفئة: ' + carClass + '\n' +
              '- اسم العميل: ' + name + '\n' +
              '- الجوال: ' + phone;
    
    var adminPhone = '966554082283';
    window.open('https://wa.me/' + adminPhone + '?text=' + encodeURIComponent(msg), '_blank');
}

// فحص رابط الـ URL لمعرفة ما إذا كان الزائر ينقر على رابط سيارة مباشر
function checkUrlForCar() {
    var urlParams = new URLSearchParams(window.location.search);
    var carId = urlParams.get('car');
    
    if (carId && window.carsData) {
        goToCarDetails(carId);
    }
}

// معالجة زر الرجوع/التقدم بالمتصفح بشكل سلس دون أي قلتش
window.addEventListener('popstate', function(event) {
    var urlParams = new URLSearchParams(window.location.search);
    var carId = urlParams.get('car');
    
    if (carId) {
        goToCarDetails(carId);
    } else {
        switchView('gallery', false);
    }
});

// التشغيل الابتدائي عند فتح الموقع
window.addEventListener('DOMContentLoaded', function() {
    checkUrlForCar();
});
