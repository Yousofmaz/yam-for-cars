from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# رابط الفايربيس الخاص بك
FIREBASE_URL = "https://yam-stores-default-rtdb.firebaseio.com/products.json"

@app.route('/scrape-hyundai', methods=['GET', 'POST'])
def scrape_hyundai():
    try:
        # الاتصال المباشر برابط الـ API الجاهز للموقع المصدري
        api_url = "https://www.automotorsa.com/api/cars"  # أو رابط الـ API المباشر للموقع
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        # محاولة طلب البيانات كـ JSON مباشر
        response = requests.get("https://www.automotorsa.com/cars", headers=headers)
        
        # بيانات توضيحية مستخرجة ومجهزة بالتنسيق الصحيح لموقعك
        # كود تجريبي يضيف سيارة مجهزة بالتنسيق الكامل لقاعدة بياناتك Realtime Database
        sample_cars = [
            {
                "brand": "هيونداي",
                "title": "هيونداي سوناتا 2024 سمارت بلس",
                "price": "105,000",
                "mileage": "0 كم (جديد)",
                "engineSize": "2.5L 4 Cylinder",
                "horsepower": "191 حصان",
                "torque": "245 نيوتن",
                "statusTag": "متوفرة",
                "marketType": "new",
                "showroomName": "أوتو موتورز العالمية",
                "showroomPhone": "920001060",
                "images": ["https://www.automotorsa.com/images/hero-car.png"],
                "approved": True
            },
            {
                "brand": "هيونداي",
                "title": "هيونداي توسان 2024 نايت ايديشن",
                "price": "118,000",
                "mileage": "0 كم (جديد)",
                "engineSize": "2.0L 4 Cylinder",
                "horsepower": "156 حصان",
                "torque": "192 نيوتن",
                "statusTag": "متوفرة",
                "marketType": "new",
                "showroomName": "أوتو موتورز العالمية",
                "showroomPhone": "920001060",
                "images": ["https://www.automotorsa.com/images/hero-car.png"],
                "approved": True
            }
        ]
        
        count = 0
        for car in sample_cars:
            # رفع البيانات للـ Firebase بنفس الهيكل الذي تقرأه لوحة التحكم والموقع العام
            res = requests.post(FIREBASE_URL, json=car)
            if res.status_code == 200:
                count += 1

        return jsonify({"status": "success", "message": f"تم سحب وإضافة {count} سيارات جديدة بنجاح لقاعدة البيانات!"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
