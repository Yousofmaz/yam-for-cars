from flask import Flask, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
import os

app = Flask(__name__)
CORS(app)

FIREBASE_URL = "https://yam-stores-default-rtdb.firebaseio.com/products.json"

@app.route('/scrape-hyundai', methods=['GET', 'POST'])
def scrape_hyundai():
    try:
        url = "https://www.automotorsa.com/cars"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")
        
        # جلب جميع عناصر الصفحة
        car_cards = soup.find_all("div") 
        
        count = 0
        for card in car_cards:
            text_content = card.text.strip()
            
            # تم إلغاء شرط هيونداي لكي يسحب جميع السيارات
            if len(text_content) > 10:  # التأكد أن العنصر يحتوي على نص سيارة
                img_tag = card.find("img")
                img_url = img_tag["src"] if img_tag and "src" in img_tag.attrs else "https://placehold.co/600x400"
                
                car_data = {
                    "brand": "سيارة معرض",
                    "title": text_content[:50] if text_content else "سيارة جديدة",
                    "price": "السعر بعد التواصل",
                    "statusTag": "متوفرة",
                    "images": [img_url],
                    "marketType": "used",
                    "approved": True
                }
                
                # إضافة السيارة مباشرة إلى Firebase
                requests.post(FIREBASE_URL, json=car_data)
                count += 1

        return jsonify({"status": "success", "message": f"تم سحب وحفظ جميع السيارات بنجاح!"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
