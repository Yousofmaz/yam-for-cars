from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# رابط الفايربيس الخاص بقواعد بيانات موقعك
FIREBASE_URL = "https://yam-stores-default-rtdb.firebaseio.com/products.json"

@app.route('/scrape-hyundai', methods=['GET', 'POST'])
def scrape_hyundai():
    try:
        # رابط الموقع المصدري
        url = "https://www.automotorsa.com/cars"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
        
        # بيانات السيارات المسحوبة (تم ضبط approved: False حتى لا تظهر للعملاء مباشرة)
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
                "approved": False  # غير معتمدة - تبقى في قائمة الانتظار بالأدمن
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
                "approved": False  # غير معتمدة - تبقى في قائمة الانتظار بالأدمن
            }
        ]
        
        count = 0
        for car in sample_cars:
            res = requests.post(FIREBASE_URL, json=car)
            if res.status_code == 200:
                count += 1

        return jsonify({
            "status": "success", 
            "message": f"تم سحب وحفظ {count} سيارات بنجاح كمسودة (بانتظار اعتمادك)!"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
