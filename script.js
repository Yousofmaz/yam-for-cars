// ==========================================
// YAM FOR CARS - MAIN SCRIPT
// ==========================================

// بيانات السيارات المتوفرة افتراضياً
if (!window.carsData) {
    window.carsData = [
        {
            id: "1",
            category: "used",
            brand: "مرسيدس بنز",
            name: "مرسيدس S-Class 2024",
            price: "450000",
            mileage: "15,000 كم",
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
            description: "حالة نظيفة جداً، حماية صبغ كامل، بانوراما، داخلية جلد أحمر فاخر.",
            images: [
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
            ]
        }
    ];
}

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

// عرض السيارات بتصميم مستطيل أصغر وأفقي وبدون حجم مكينة أو أحصنة أو عزم
function renderCars() {
    var container = document.getElementById('cars-list-container');
    if (!container) return;

    var brandFilter = document.getElementById('filter-brand') ? document.getElementById('filter-brand').value : '';
    var searchFilter = document.getElementById('filter-search') ? document.getElementById('filter-search').value.toLowerCase() : '';
    var sortFilter = document.getElementById('filter-sort') ? document.getElementById('filter-sort').value : 'default';

    var filtered = window.carsData.filter(function(car) {
        var matchCategory = !currentCategory || car.category === currentCategory;
        var matchBrand = brandFilter === '' || car.brand === brandFilter;
        var matchSearch = !searchFilter || 
                          (car.name && car.name.toLowerCase().indexOf(searchFilter) !== -1) || 
                          (car.description && car.description.toLowerCase().indexOf(searchFilter) !== -1);
        return matchCategory && matchBrand && matchSearch;
    });

    if (sortFilter === 'high-to-low') {
        filtered.sort(function(a, b) { return Number(b.price || 0) - Number(a.price || 0); });
    } else if (sortFilter === 'low-to-high') {
        filtered.sort(function(a, b) { return Number(a.price || 0) - Number(b.price || 0); });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="card-box rounded-2xl p-8 text-center text-neutral-400 border gold-border">لا توجد سيارات مطابقة لبحثك حالياً.</div>';
        return;
    }

    container.innerHTML = filtered.map(function(car) {
        var carImg = (car.images && car.images.length > 0) ? car.images[0] : 'https://via.placeholder.com/400x250?text=No+Image';
        return `
            <div class="card-box rounded-2xl border gold-border p-2.5 sm:p-3 flex flex-col sm:flex-row gap-3 items-center group hover:border-[#d4af37] transition-all cursor-pointer shadow-lg" onclick="goToCarDetails('${car.id}')">
                
                <!-- صورة الإعلان أفقي ومستطيل أصغر -->
                <div class="w-full sm:w-48 h-32 sm:h-28 rounded-xl overflow-hidden bg-black shrink-0 relative border gold-border">
                    <img src="${carImg}" alt="${car.name || ''}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/80 text-amber-300 border gold-border text-[9px] font-bold rounded-md">
                        ${car.category === 'used' ? 'مستعمل' : 'جديد'}
                    </span>
                </div>

                <!-- التفاصيل الأساسية -->
                <div class="flex-1 space-y-1.5 w-full text-right">
                    <div>
                        <span class="text-[10px] gold-text font-mono font-bold block">${car.brand || ''}</span>
                        <h3 class="text-sm font-black text-white group-hover:text-amber-300 transition-colors">${car.name || ''}</h3>
                    </div>
                    
                    <p class="text-[11px] text-neutral-400 line-clamp-1 leading-relaxed">${car.description || ''}</p>
                    
                    <div class="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-mono text-neutral-300">
                        ${car.mileage ? `<span class="bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-800"><i class="fa-solid fa-gauge text-amber-400 ml-1"></i> ${car.mileage}</span>` : ''}
                    </div>
                </div>

                <!-- السعر والزر -->
                <div class="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <div class="text-right sm:text-left">
                        <span class="text-[10px] text-neutral-400 block sm:hidden">السعر:</span>
                        <span class="text-sm sm:text-base font-black font-mono gold-text">${car.price ? car.price + ' ﷼' : 'عند الاتصال'}</span>
                    </div>
                    <button class="sm:mt-2 px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black font-black text-[11px] rounded-lg shadow hover:opacity-90 transition-all flex items-center gap-1">
                        التفاصيل <i class="fa-solid fa-arrow-left text-[9px]"></i>
                    </button>
                </div>

            </div>
        `;
    }).join('');
}

// الانتقال لصفحة التفاصيل بدون أخطاء
function goToCarDetails(id) {
    var car = window.carsData.find(function(c) { return String(c.id) === String(id); });
    if (!car) return;

    currentCarData = car;
    currentImageIndex = 0;

    document.getElementById('d-full-title').innerText = car.name || '--';
    document.getElementById('d-brand-badge').innerText = car.brand || '--';
    document.getElementById('d-price').innerText = car.price ? car.price + ' ﷼' : 'عند الاتصال';
    document.getElementById('d-mileage').innerText = car.mileage || 'غير محدد';
    document.getElementById('d-desc').innerText = car.description || 'لا يوجد وصف إضافي.';

    updateCarImages(car.images || []);

    var carUrl = window.location.origin + window.location.pathname + '?car=' + encodeURIComponent(car.id);
    window.history.pushState({ carId: car.id, view: 'car-details' }, '', carUrl);

    var whatsappMsg = 'أهلاً وسهلاً بك في *YAM FOR CARS* 🏎️✨\n\n' +
                      'يسعدنا استفسارك عن السيارة التالية:\n' +
                      '📌 *السيارة:* ' + (car.name || '') + '\n' +
                      '💰 *السعر:* ' + (car.price ? car.price + ' ﷼' : 'عند الاتصال') + '\n\n' +
                      '🔗 *رابط المعاينة والتفاصيل:*\n' + carUrl + '\n\n' +
                      'يرجى تزويدنا باستفسارك أو تحديد الموعد المناسب لمعاينة السيارة!';

    var whatsappBtn = document.getElementById('d-whatsapp-btn');
    var phone = '966554082283';
    if (whatsappBtn) {
        whatsappBtn.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(whatsappMsg);
    }

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
        if (mainImg) mainImg.src = images[currentImageIndex];
        if (thumbsContainer) {
            thumbsContainer.innerHTML = images.map(function(img, idx) {
                return '<img src="' + img + '" onclick="setMainImage(' + idx + ')" class="w-16 h-12 object-cover rounded-lg cursor-pointer border ' + (idx === currentImageIndex ? 'border-amber-400 opacity-100' : 'border-neutral-700 opacity-60') + ' hover:opacity-100 transition-all">';
            }).join('');
        }
    }
}

function setMainImage(idx) {
    if (currentCarData && currentCarData.images && currentCarData.images.length > idx) {
        currentImageIndex = idx;
        var mainImg = document.getElementById('d-main-img');
        if (mainImg) mainImg.src = currentCarData.images[currentImageIndex];
        updateCarImages(currentCarData.images);
    }
}

function nextImage() {
    if (currentCarData && currentCarData.images && currentCarData.images.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
}

function prevImage() {
    if (currentCarData && currentCarData.images && currentCarData.images.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + currentCarData.images.length) % currentCarData.images.length;
        setMainImage(currentImageIndex);
    }
}

// تكبير الصورة والأسهم الداخلية في النافذة (Lightbox)
function openFullscreenImg() {
    if (currentCarData && currentCarData.images && currentCarData.images.length > 0) {
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = currentCarData.images[currentImageIndex];
        var modal = document.getElementById('lightbox-modal');
        if (modal) modal.classList.remove('hidden');
    }
}

function closeFullscreenImg() {
    var modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.add('hidden');
}

function lightboxNext(event) {
    if (event) event.stopPropagation();
    if (currentCarData && currentCarData.images && currentCarData.images.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentCarData.images.length;
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = currentCarData.images[currentImageIndex];
        updateCarImages(currentCarData.images);
    }
}

function lightboxPrev(event) {
    if (event) event.stopPropagation();
    if (currentCarData && currentCarData.images && currentCarData.images.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + currentCarData.images.length) % currentCarData.images.length;
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = currentCarData.images[currentImageIndex];
        updateCarImages(currentCarData.images);
    }
}

function renderSimilarCars(car) {
    var grid = document.getElementById('similar-cars-grid');
    if (!grid) return;
    
    var similar = window.carsData.filter(function(c) { return String(c.id) !== String(car.id) && c.category === car.category; }).slice(0, 2);
    
    if (similar.length === 0) {
        grid.innerHTML = '<span class="text-xs text-neutral-500 col-span-2">لا توجد سيارات مشابهة حالياً.</span>';
        return;
    }

    grid.innerHTML = similar.map(function(sim) {
        var simImg = (sim.images && sim.images.length > 0) ? sim.images[0] : '';
        return `
            <div onclick="goToCarDetails('${sim.id}')" class="card-box p-2.5 rounded-xl border gold-border cursor-pointer flex items-center gap-3 hover:border-amber-400 transition-all">
                <img src="${simImg}" class="w-16 h-12 object-cover rounded-lg shrink-0">
                <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-white truncate">${sim.name || ''}</h5>
                    <span class="text-[10px] font-mono gold-text block mt-0.5">${sim.price ? sim.price + ' ﷼' : 'عند الاتصال'}</span>
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

function checkUrlForCar() {
    var urlParams = new URLSearchParams(window.location.search);
    var carId = urlParams.get('car');
    
    if (carId && window.carsData) {
        goToCarDetails(carId);
    }
}

window.addEventListener('popstate', function(event) {
    var urlParams = new URLSearchParams(window.location.search);
    var carId = urlParams.get('car');
    
    if (carId) {
        goToCarDetails(carId);
    } else {
        switchView('gallery', false);
    }
});

window.addEventListener('DOMContentLoaded', function() {
    checkUrlForCar();
});
