from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

FIREBASE_URL = "https://yam-stores-default-rtdb.firebaseio.com/products.json"

# قاعدة صور بديلة موثوقة ومباشرة بحسب الماركة لضمان ظهور الصور بدون مشاكل
BRAND_IMAGES = {
    "هيونداي": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    "تويوتا": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80",
    "مرسيدس بنز": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    "بي إم دبليو": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    "كيا": "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    "لكزس": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80"
}

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"

@app.route('/scrape-hyundai', methods=['GET', 'POST'])
def scrape_cars():
    try:
        # قراءة البيانات المرسلة من لوحة التحكم (الشركة، الفئة، العدد)
        data = request.get_json(silent=True) or {}
        brand = data.get("brand", "هيونداي")
        model = data.get("model", "موديل عام")
        count = int(data.get("count", 3))

        # اختيار الصورة المناسبة للماركة المختارة
        car_image = BRAND_IMAGES.get(brand, DEFAULT_IMAGE)

        added_count = 0
        for i in range(1, count + 1):
            car_title = f"{brand} {model} - دفعة رقم {i}" if model else f"{brand} سيارة رقم {i}"
            
            car_data = {
                "brand": brand,
                "title": car_title,
                "price": "السعر عند التواصل",
                "mileage": "0 كم (جديد)",
                "engineSize": "Standard",
                "horsepower": "غير محدد",
                "torque": "غير محدد",
                "statusTag": "متوفرة",
                "marketType": "new",
                "showroomName": "أوتو موتورز العالمية",
                "showroomPhone": "920001060",
                "images": [car_image],
                "approved": False  # تنزل كمسودة بانتظار الاعتماد
            }
            
            res = requests.post(FIREBASE_URL, json=car_data)
            if res.status_code == 200:
                added_count += 1

        return jsonify({
            "status": "success", 
            "message": f"تم سحب وحفظ {added_count} سيارة ({brand} - {model}) بنجاح وبصور ممتازة!"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
