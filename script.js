// ==========================================
// YAM FOR CARS - MAIN SCRIPT (FINAL SYNC)
// ==========================================

window.carsData = [];
window.currentCategory = 'used';
window.currentCarData = null;
window.currentImageIndex = 0;

// بدء الاستماع لبيانات السيارات من قاعدة بيانات فايربيس
window.initCarsListener = function() {
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.error("Firebase لم يتم تحميله بعد!");
        return;
    }

    // جلب البيانات من مسار الجذر الرئيسي أو العقدة الصحيحة
    const dbRef = firebase.database().ref();
    dbRef.on('value', (snapshot) => {
        const rootData = snapshot.val();
        window.carsData = [];
        
        if (rootData) {
            // البحث عن جدول السيارات أياً كان مساره (cars أو غيره)
            let carsNode = rootData.cars || rootData.car || rootData.products || rootData;
            
            if (rootData.cars) {
                carsNode = rootData.cars;
            } else {
                // إذا كانت مخزنة مباشرة أو تحت اسم آخر
                carsNode = rootData;
            }

            Object.keys(carsNode).forEach(key => {
                // التأكد من أن العنصر يحتوي على بيانات سيارة (مثل السعر أو العنوان)
                const item = carsNode[key];
                if (item && (item.title || item.name || item.price)) {
                    window.carsData.push({
                        id: key,
                        ...item
                    });
                }
            });
        }
        
        console.log("السيارات المحملة:", window.carsData);
        window.renderCars();
        window.checkUrlForCar();
    }, (error) => {
        console.error("خطأ في جلب البيانات:", error);
    });
};

// التنقل بين الشاشات
window.switchView = function(viewName, pushState = true) {
    var views = ['view-home', 'view-gallery', 'view-car-details', 'view-services', 'view-request'];
    views.forEach(function(v) {
        var el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    var targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.remove('hidden');

    if (viewName === 'gallery') {
        window.renderCars();
    }

    if (pushState && viewName !== 'car-details') {
        window.history.pushState({ view: viewName }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// اختيار القسم
window.selectCategory = function(category) {
    window.currentCategory = category;
    var titleEl = document.getElementById('gallery-title');
    if (titleEl) {
        titleEl.innerText = category === 'used' ? 'السيارات المستعملة بحالة الوكالة' : 'السيارات الجديدة (وكالة)';
    }
    window.switchView('gallery');
};

// عرض السيارات بشكل أفقي ومستطيل
window.renderCars = function() {
    var container = document.getElementById('cars-list-container');
    if (!container) return;

    var brandFilter = document.getElementById('filter-brand') ? document.getElementById('filter-brand').value : '';
    var searchFilter = document.getElementById('filter-search') ? document.getElementById('filter-search').value.toLowerCase() : '';
    var sortFilter = document.getElementById('filter-sort') ? document.getElementById('filter-sort').value : 'default';

    var filtered = (window.carsData || []).filter(function(car) {
        var matchBrand = brandFilter === '' || car.brand === brandFilter;
        var carTitle = car.title || car.name || '';
        var matchSearch = !searchFilter || carTitle.toLowerCase().indexOf(searchFilter) !== -1;
        return matchBrand && matchSearch;
    });

    if (sortFilter === 'high-to-low') {
        filtered.sort(function(a, b) { return Number(String(b.price || '0').replace(/[^0-9]/g, '')) - Number(String(a.price || '0').replace(/[^0-9]/g, '')); });
    } else if (sortFilter === 'low-to-high') {
        filtered.sort(function(a, b) { return Number(String(a.price || '0').replace(/[^0-9]/g, '')) - Number(String(b.price || '0').replace(/[^0-9]/g, '')); });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="card-box rounded-2xl p-8 text-center text-neutral-400 border gold-border">لا توجد سيارات مسجلة في قاعدة البيانات حالياً. تأكد من إضافتها عبر لوحة التحكم.</div>';
        return;
    }

    container.innerHTML = filtered.map(function(car) {
        var imagesList = car.images || [];
        var carImg = (imagesList.length > 0) ? imagesList[0] : 'https://via.placeholder.com/400x250?text=No+Image';
        var carTitle = car.title || car.name || 'سيارة بدون عنوان';

        return `
            <div class="card-box rounded-2xl border gold-border p-2.5 sm:p-3 flex flex-col sm:flex-row gap-3 items-center group hover:border-[#d4af37] transition-all cursor-pointer shadow-lg" onclick="window.goToCarDetails('${car.id}')">
                
                <div class="w-full sm:w-48 h-32 sm:h-28 rounded-xl overflow-hidden bg-black shrink-0 relative border gold-border">
                    <img src="${carImg}" alt="${carTitle}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/80 text-amber-300 border gold-border text-[9px] font-bold rounded-md">
                        ${car.marketType || 'متوفر'}
                    </span>
                </div>

                <div class="flex-1 space-y-1.5 w-full text-right">
                    <div>
                        <span class="text-[10px] gold-text font-mono font-bold block">${car.brand || ''}</span>
                        <h3 class="text-sm font-black text-white group-hover:text-amber-300 transition-colors">${carTitle}</h3>
                    </div>
                    <p class="text-[11px] text-neutral-400 line-clamp-1 leading-relaxed">${car.trim || ''} - موديل ${car.year || ''}</p>
                    <div class="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-mono text-neutral-300">
                        ${car.mileage ? `<span class="bg-neutral-900/80 px-2 py-0.5 rounded-md border border-neutral-800"><i class="fa-solid fa-gauge text-amber-400 ml-1"></i> ${car.mileage}</span>` : ''}
                    </div>
                </div>

                <div class="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <div class="text-right sm:text-left">
                        <span class="text-[10px] text-neutral-400 block sm:hidden">السعر:</span>
                        <span class="text-sm sm:text-base font-black font-mono gold-text">${car.price ? car.price : 'عند الاتصال'}</span>
                    </div>
                    <button class="sm:mt-2 px-3 py-1.5 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black font-black text-[11px] rounded-lg shadow hover:opacity-90 transition-all flex items-center gap-1">
                        التفاصيل <i class="fa-solid fa-arrow-left text-[9px]"></i>
                    </button>
                </div>

            </div>
        `;
    }).join('');
};

// صفحة التفاصيل
window.goToCarDetails = function(id) {
    var car = (window.carsData || []).find(function(c) { return String(c.id) === String(id); });
    if (!car) return;

    window.currentCarData = car;
    window.currentImageIndex = 0;

    var carTitle = car.title || car.name || '--';
    var imagesList = car.images || [];

    document.getElementById('d-full-title').innerText = carTitle;
    document.getElementById('d-brand-badge').innerText = (car.brand || '') + ' | ' + (car.year || '');
    document.getElementById('d-price').innerText = car.price ? car.price : 'عند الاتصال';
    document.getElementById('d-mileage').innerText = car.mileage || 'غير محدد';
    document.getElementById('d-desc').innerText = `الفئة: ${car.trim || '--'} \nحالة السوق: ${car.marketType || '--'} \nالحالة: ${car.statusTag || 'متوفرة'}`;

    window.updateCarImages(imagesList);

    var carUrl = window.location.origin + window.location.pathname + '?car=' + encodeURIComponent(id);
    window.history.pushState({ carId: id, view: 'car-details' }, '', carUrl);

    var whatsappMsg = 'أهلاً وسهلاً بك في *YAM FOR CARS* 🏎️✨\n\n' +
                      'يسعدنا استفسارك عن السيارة التالية:\n' +
                      '📌 *السيارة:* ' + carTitle + '\n' +
                      '💰 *السعر:* ' + (car.price || 'عند الاتصال') + '\n\n' +
                      '🔗 *رابط المعاينة والتفاصيل:*\n' + carUrl + '\n\n' +
                      'يرجى تزويدنا باستفسارك أو تحديد الموعد المناسب للمعاينة!';

    var whatsappBtn = document.getElementById('d-whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.href = 'https://wa.me/966554082283?text=' + encodeURIComponent(whatsappMsg);
    }

    window.renderSimilarCars(car);
    window.switchView('car-details', false);
};

window.backToGallery = function() {
    window.switchView('gallery', true);
};

window.updateCarImages = function(images) {
    var mainImg = document.getElementById('d-main-img');
    var thumbsContainer = document.getElementById('img-thumbnails');
    
    if (images && images.length > 0) {
        if (mainImg) mainImg.src = images[window.currentImageIndex];
        if (thumbsContainer) {
            thumbsContainer.innerHTML = images.map(function(img, idx) {
                return '<img src="' + img + '" onclick="window.setMainImage(' + idx + ')" class="w-16 h-12 object-cover rounded-lg cursor-pointer border ' + (idx === window.currentImageIndex ? 'border-amber-400 opacity-100' : 'border-neutral-700 opacity-60') + ' hover:opacity-100 transition-all">';
            }).join('');
        }
    }
};

window.setMainImage = function(idx) {
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > idx) {
        window.currentImageIndex = idx;
        var mainImg = document.getElementById('d-main-img');
        if (mainImg) mainImg.src = window.currentCarData.images[window.currentImageIndex];
        window.updateCarImages(window.currentCarData.images);
    }
};

window.nextImage = function() {
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > 0) {
        window.currentImageIndex = (window.currentImageIndex + 1) % window.currentCarData.images.length;
        window.setMainImage(window.currentImageIndex);
    }
};

window.prevImage = function() {
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > 0) {
        window.currentImageIndex = (window.currentImageIndex - 1 + window.currentCarData.images.length) % window.currentCarData.images.length;
        window.setMainImage(window.currentImageIndex);
    }
};

window.openFullscreenImg = function() {
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > 0) {
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = window.currentCarData.images[window.currentImageIndex];
        var modal = document.getElementById('lightbox-modal');
        if (modal) modal.classList.remove('hidden');
    }
};

window.closeFullscreenImg = function() {
    var modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.add('hidden');
};

window.lightboxNext = function(event) {
    if (event) event.stopPropagation();
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > 0) {
        window.currentImageIndex = (window.currentImageIndex + 1) % window.currentCarData.images.length;
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = window.currentCarData.images[window.currentImageIndex];
        window.updateCarImages(window.currentCarData.images);
    }
};

window.lightboxPrev = function(event) {
    if (event) event.stopPropagation();
    if (window.currentCarData && window.currentCarData.images && window.currentCarData.images.length > 0) {
        window.currentImageIndex = (window.currentImageIndex - 1 + window.currentCarData.images.length) % window.currentCarData.images.length;
        var lbImg = document.getElementById('lightbox-img');
        if (lbImg) lbImg.src = window.currentCarData.images[window.currentImageIndex];
        window.updateCarImages(window.currentCarData.images);
    }
};

window.renderSimilarCars = function(car) {
    var grid = document.getElementById('similar-cars-grid');
    if (!grid) return;
    
    var simId = car.id;
    var similar = (window.carsData || []).filter(function(c) { return String(c.id) !== String(simId); }).slice(0, 2);
    
    if (similar.length === 0) {
        grid.innerHTML = '<span class="text-xs text-neutral-500 col-span-2">لا توجد سيارات مشابهة حالياً.</span>';
        return;
    }

    grid.innerHTML = similar.map(function(sim) {
        var imgs = sim.images || [];
        var simImg = imgs.length > 0 ? imgs[0] : '';
        return `
            <div onclick="window.goToCarDetails('${sim.id}')" class="card-box p-2.5 rounded-xl border gold-border cursor-pointer flex items-center gap-3 hover:border-amber-400 transition-all">
                <img src="${simImg}" class="w-16 h-12 object-cover rounded-lg shrink-0">
                <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-white truncate">${sim.title || sim.name || ''}</h5>
                    <span class="text-[10px] font-mono gold-text block mt-0.5">${sim.price ? sim.price : 'عند الاتصال'}</span>
                </div>
            </div>
        `;
    }).join('');
};

window.copyCarLink = function() {
    if (!window.currentCarData) return;
    var carId = window.currentCarData.id;
    var carUrl = window.location.origin + window.location.pathname + '?car=' + encodeURIComponent(carId);
    
    navigator.clipboard.writeText(carUrl).then(function() {
        alert('✨ تم نسخ رابط السيارة بنجاح!');
    });
};

window.toggleFilterBox = function() {
    var box = document.getElementById('filter-container');
    if (box) box.classList.toggle('hidden');
};

window.applyFilters = function() {
    window.renderCars();
};

window.openServicesView = function() {
    window.switchView('services');
};

window.checkUrlForCar = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var carId = urlParams.get('car');
    if (carId && window.carsData.length > 0) {
        window.goToCarDetails(carId);
    }
};
