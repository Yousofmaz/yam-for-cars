from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import firebase_admin
from firebase_admin import credentials, firestore

# تهيئة Firebase (تأكد أن اسم ملف الاعتماد يطابق الملف اللي بترفعه)
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def scrape_hyundai_cars():
    print("جاري تشغيل المتصفح وسحب البيانات من أوتو موتورز...")
    
    options = Options()
    options.add_argument("--headless") # تشغيل المتصفح بالخلفية بدون نافذة
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        url = "https://www.automotorsa.com/cars"
        driver.get(url)
        time.sleep(6) # انتظار تحميل الصفحة
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        # ملاحظة: سنقوم بتعديل اسم الـ class لاحقاً بناءً على شكل الموقع الفعلي
        car_cards = soup.find_all("div", class_="car-card") 
        
        count = 0
        for card in car_cards:
            title_elem = card.find("h3")
            price_elem = card.find("span", class_="price")
            img_elem = card.find("img")
            
            title = title_elem.text.strip() if title_elem else "سيارة غير معروفة"
            price = price_elem.text.strip() if price_elem else "السعر غير متوفر"
            image_url = img_elem["src"] if img_elem and "src" in img_elem.attrs else ""
            
            # تصفية سيارات هيونداي فقط
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
                print(f"تم حفظ: {title}")
                
        print(f"تم الانتهاء بنجاح! تم سحب وحفظ {count} سيارة هيونداي.")

    except Exception as e:
        print(f"حدث خطأ أثناء السحب: {e}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    scrape_hyundai_cars()
