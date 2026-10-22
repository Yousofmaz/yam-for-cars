// متغير عام لتخزين السيارة المعروضة حالياً داخل النافذة المنبثقة
let currentCarData = null;

// دالة فتح تفاصيل السيارة وتحديث الـ URL والواتساب
function openDetailsModal(car) {
    currentCarData = car;
    
    // تعبئة البيانات في واجهة النافذة
    document.getElementById('d-title').innerText = car.name || 'تفاصيل السيارة';
    document.getElementById('d-full-title').innerText = car.name || '--';
    document.getElementById('d-price').innerText = car.price ? `${car.price} ﷼` : 'عند الاتصال';
    document.getElementById('d-mileage').innerText = car.mileage || 'جديد';
    document.getElementById('d-engine').innerText = car.engine || '--';
    document.getElementById('d-hp').innerText = car.hp || '--';
    document.getElementById('d-torque').innerText = car.torque || '--';
    document.getElementById('d-desc').innerText = car.description || 'لا يوجد وصف إضافي.';
    
    // إنشاء رابط فريد ومستقل للسيارة بناءً على معرّفها (ID)
    const carUrl = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(car.id)}`;
    
    // تحديث شريط عنوان المتصفح دون إعادة تحميل الصفحة
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

    // إظهار نافذة التفاصيل
    document.getElementById('details-modal').classList.remove('hidden');
}

// دالة إغلاق النافذة وإعادة الـ URL للوضع الطبيعي
function closeDetailsModal() {
    document.getElementById('details-modal').classList.add('hidden');
    window.history.pushState({}, '', window.location.pathname);
}

// دالة نسخ رابط السيارة المباشر
function copyCarLink() {
    if (!currentCarData) return;
    
    const carUrl = `${window.location.origin}${window.location.pathname}?car=${encodeURIComponent(currentCarData.id)}`;
    
    navigator.clipboard.writeText(carUrl).then(() => {
        alert('✨ تم نسخ رابط السيارة بنجاح! يمكنك الآن مشاركته في أي مكان.');
    }).catch(err => {
        console.error('فشل نسخ الرابط:', err);
    });
}

// فحص الروابط عند الدخول المباشر (Deep Linking)
window.addEventListener('DOMContentLoaded', () => {
    // افترضنا أن مصفوفة السيارات لديك مخزنة أو يتم جلبها، يمكنك استدعاء دالة الفحص هنا بمجرد توفر البيانات
    setTimeout(checkUrlForCar, 500); 
});

function checkUrlForCar() {
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('car');
    
    if (carId && window.carsData && Array.isArray(window.carsData)) {
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
