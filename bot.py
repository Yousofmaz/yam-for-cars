from flask import Flask, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import firebase_admin
from firebase_admin import credentials, firestore
import os

app = Flask(__name__)
CORS(app) # للسماح لصفحة الأدمن بالتواصل مع البوت بدون مشاكل حظر (CORS)

# تهيئة اتصال Firebase
# تأكد من تجهيز المفتاح كمتغير بيئة (Environment Variable) أو ملف منفصل
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/scrape-hyundai', methods=['GET', 'POST'])
def scrape_hyundai():
    try:
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        
        driver = webdriver.Chrome(options=options)
        
        url = "https://www.automotorsa.com/cars"
        driver.get(url)
        time.sleep(6)
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        car_cards = soup.find_all("div", class_="car-card") # سنحدّث الـ class لاحقاً حسب الموقع
        
        count = 0
        for card in car_cards:
            title_elem = card.find("h3")
            price_elem = card.find("span", class_="price")
            img_elem = card.find("img")
            
            title = title_elem.text.strip() if title_elem else "سيارة غير معروفة"
            price = price_elem.text.strip() if price_elem else "السعر غير متوفر"
            image_url = img_elem["src"] if img_elem and "src" in img_elem.attrs else ""
            
            if "هيونداي" in title or "Hyundai" in title:
                car_data = {
                    "title": title,
                    "price": price,
                    "image": image_url,
                    "brand": "Hyundai",
                    "timestamp": firestore.SERVER_TIMESTAMP
                }
                db.collection("cars").add(car_data)
                count += 1
                
        driver.quit()
        return jsonify({"status": "success", "message": f"تم سحب وحفظ {count} سيارة هيونداي بنجاح!"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # تشغيل السيرفر على البورت المحدد من الاستضافة أو 5000 محلياً
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
