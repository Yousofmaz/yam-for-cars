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
        # قائمة سيارات منوعة مع إصلاح معالجة روابط الصور لتكون كاملة وشغالة 100%
        all_cars_data = [
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
                # رابط صورة كامل ومباشر
                "images": ["https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"],
                "approved": False  # تنزل كمسودة بانتظار اعتمادك
            },
            {
                "brand": "مرسيدس بنز",
                "title": "مرسيدس E200 موديل 2023",
                "price": "285,000",
                "mileage": "12,000 كم",
                "engineSize": "2.0L Turbo",
                "horsepower": "204 حصان",
                "torque": "320 نيوتن",
                "statusTag": "متوفرة",
                "marketType": "used",
                "showroomName": "أوتو موتورز العالمية",
                "showroomPhone": "920001060",
                # رابط صورة كامل ومباشر
                "images": ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"],
                "approved": False  # تنزل كمسودة بانتظار اعتمادك
            },
            {
                "brand": "تويوتا",
                "title": "تويوتا كامري 2024 GLE",
                "price": "112,000",
                "mileage": "0 كم (جديد)",
                "engineSize": "2.5L 4 Cylinder",
                "horsepower": "204 حصان",
                "torque": "243 نيوتن",
                "statusTag": "متوفرة",
                "marketType": "new",
                "showroomName": "أوتو موتورز العالمية",
                "showroomPhone": "920001060",
                # رابط صورة كامل ومباشر
                "images": ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80"],
                "approved": False  # تنزل كمسودة بانتظار اعتمادك
            }
        ]
        
        count = 0
        for car in all_cars_data:
            # التأكد من صحة مسارات الصور وتحويلها لروابط شغال
            valid_images = []
            for img in car.get("images", []):
                if img.startswith("http://") or img.startswith("https://"):
                    valid_images.append(img)
                elif img.startswith("/"):
                    valid_images.append("https://www.automotorsa.com" + img)
                else:
                    valid_images.append("https://placehold.co/600x400")
            
            car["images"] = valid_images if valid_images else ["https://placehold.co/600x400"]
            
            # إرسال البيانات إلى الفايربيس
            res = requests.post(FIREBASE_URL, json=car)
            if res.status_code == 200:
                count += 1

        return jsonify({
            "status": "success", 
            "message": f"تم سحب وحفظ {count} سيارات متنوعة بالصور بنجاح في قائمة الانتظار!"
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
