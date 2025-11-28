# Qeseh Modern Style Extension (Mjeed Style)

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg) ![Author](https://img.shields.io/badge/author-Mjeed%20Alanazi-red.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

**[English]**  
A complete visual overhaul for the Qeseh website, transforming it into a premium streaming experience with a modern, cinematic aesthetic. This extension enhances the user interface, adds a "My List" feature, and improves responsiveness across all devices.

**[العربية]**  
إعادة تصميم شاملة لموقع قصة عشق، تحوله إلى تجربة مشاهدة فاخرة بتصميم عصري وجذاب. تقوم هذه الإضافة بتحسين واجهة المستخدم، وإضافة ميزة "قائمتي"، وتحسين الاستجابة على جميع الأجهزة.

---

## ✨ Features / المميزات

### 🇬🇧 English
*   **Premium UI Redesign:** A dark, modern theme with glassmorphism effects, smooth animations, and a clean grid layout.
*   **"My List" Functionality:** Easily add series to your favorites list. Your list is synchronized across all your devices (Chrome Sync).
*   **Export Favorites:** Backup your favorites list by exporting it to a JSON file directly from the popup.
*   **Responsive Design:** Fully optimized for Desktop, Tablets, and Mobile devices.
*   **Enhanced Video Player:** A cleaner, distraction-free watching experience.
*   **Smart Popup:** Quick access to your list count, export options, and cache cleaning.
*   **Performance:** Optimized for speed with lazy loading and efficient resource management.

### 🇸🇦 العربية
*   **تصميم واجهة فاخر:** مظهر داكن وعصري مع تأثيرات الزجاج (Glassmorphism)، وحركات سلسة، وتخطيط شبكي نظيف.
*   **ميزة "قائمتي":** أضف المسلسلات بسهولة إلى قائمة المفضلة لديك. تتم مزامنة قائمتك عبر جميع أجهزتك.
*   **تصدير القائمة:** قم بعمل نسخة احتياطية من قائمة المفضلة عن طريق تصديرها إلى ملف JSON مباشرة من النافذة المنبثقة.
*   **تصميم متجاوب:** متوافق تماماً مع أجهزة الكمبيوتر، الأجهزة اللوحية، والهواتف المحمولة.
*   **مشغل فيديو محسن:** تجربة مشاهدة أنظف وخالية من المشتتات.
*   **نافذة منبثقة ذكية:** وصول سريع إلى عدد المسلسلات في قائمتك، خيارات التصدير، وتنظيف الذاكرة المؤقتة.
*   **الأداء:** محسن للسرعة مع تحميل ذكي للمحتوى وإدارة فعالة للموارد.

---

## 🌐 Supported Browsers / المتصفحات المدعومة

| Browser | Support Status | Notes |
| :--- | :--- | :--- |
| **Google Chrome** | ✅ Fully Supported | Native support via `chrome.storage` & MV3. |
| **Microsoft Edge** | ✅ Fully Supported | Native support. |
| **Brave** | ✅ Fully Supported | Native support. |
| **Orion** | ✅ Fully Supported | Optimized for WebKit & iOS. |
| **Firefox** | ✅ Supported | Compatible via MV3 support. |
| **Safari** | 🔄 Supported via Converter | Requires conversion using Xcode/Safari Converter. |

---

## 🚀 Installation / التثبيت



### 🇬🇧 English

#### Chrome, Edge, Brave, Orion
1.  **Clone or Download:** Clone this repository or download the ZIP file and extract it.
2.  **Open Extensions Page:**
    *   Chrome/Brave: `chrome://extensions/`
    *   Edge: `edge://extensions/`
    *   Orion: `orion://extensions/`
3.  **Enable Developer Mode:** Toggle the switch in the top-right corner (or bottom-left in Orion).
4.  **Load Unpacked:** Click "Load unpacked" and select the folder containing this extension.

#### Firefox
1.  Open `about:debugging#/runtime/this-firefox`
2.  Click "Load Temporary Add-on".
3.  Select the `manifest.json` file from the extension folder.

#### Safari (macOS/iOS)
1.  You need to convert the extension using Xcode.
2.  Run: `xcrun safari-web-extension-converter /path/to/extension/folder`
3.  Build and run the app in Xcode.

### 🇸🇦 العربية

#### كروم، إيدج، براف، أوريون
1.  **تحميل الملفات:** قم باستنساخ المستودع أو تحميل ملف ZIP وفك الضغط عنه.
2.  **فتح الإضافات:** اذهب إلى صفحة الإضافات في متصفحك (مثل `chrome://extensions/`).
3.  **تفعيل وضع المطور:** قم بتفعيل الزر في الزاوية العلوية اليمنى (أو اليسرى في أوريون).
4.  **تحميل إضافة غير مضغوطة:** اضغط على "Load unpacked" واختر المجلد الذي يحتوي على ملفات الإضافة.

#### فايرفوكس
1.  افتح `about:debugging#/runtime/this-firefox`
2.  اضغط على "Load Temporary Add-on".
3.  اختر ملف `manifest.json` من مجلد الإضافة.

#### سفاري (ماك/أيفون)
1.  تحتاج إلى تحويل الإضافة باستخدام Xcode.
2.  استخدم الأمر: `xcrun safari-web-extension-converter /path/to/extension/folder`
3.  قم ببناء وتشغيل التطبيق عبر Xcode.

---

## ⚠️ Known Issues / مشاكل معروفة

### 🇬🇧 English
I have tried hard to optimize and improve the display on mobile devices, tablets, and large screens, but I faced some difficulties and some issues may still appear.

### 🇸🇦 العربية
حاولت جاهداً ضبط وتحسين العرض على الهواتف المحمولة والأجهزة اللوحية والشاشات الكبيرة، ولكن واجهت بعض الصعوبات وقد تظهر بعض المشاكل.

---

## ⚙️ Configuration / الإعدادات

### 🇬🇧 English
Advanced users and developers can customize the extension's behavior by modifying the `js/config.js` file. This file acts as a central control panel for the extension.

*   **`ANIMATION`**: Adjust the speed of UI animations (Fast, Normal, Slow).
*   **`TIMING`**: Configure debounce delays for scroll and resize events to optimize performance.
*   **`BREAKPOINTS`**: Modify the pixel values for responsive design breakpoints (Mobile, Tablet, Desktop).
*   **`FEATURES`**: Toggle specific features on or off (e.g., `ENABLE_ANIMATIONS`, `ENABLE_LAZY_LOADING`).

### 🇸🇦 العربية
يمكن للمطورين والمستخدمين المتقدمين تخصيص سلوك الإضافة عن طريق تعديل ملف `js/config.js`. يعمل هذا الملف كلوحة تحكم مركزية للإضافة.

*   **`ANIMATION`**: تعديل سرعة حركات الواجهة (سريع، عادي، بطيء).
*   **`TIMING`**: ضبط زمن التأخير لأحداث التمرير وتغيير الحجم لتحسين الأداء.
*   **`BREAKPOINTS`**: تعديل قيم البكسل لنقاط التوقف في التصميم المتجاوب (جوال، تابلت، كمبيوتر).
*   **`FEATURES`**: تفعيل أو تعطيل ميزات محددة (مثل: `ENABLE_ANIMATIONS`, `ENABLE_LAZY_LOADING`).

---

## 📂 Project Structure / هيكلية المشروع

*   `manifest.json`: Extension configuration.
*   `popup.html` & `js/popup.js`: The extension popup interface.
*   `css/`: Contains the stylesheets (`mjeed_main.css`, `mjeed_series.css`, `mjeed_watch.css`).
*   `js/`: Contains the logic scripts (`mjeed_content.js`, `mjeed_series.js`, `mjeed_watch.js`, `utils.js`, `config.js`).
*   `icons/`: Extension icons.

---

## 👨‍💻 Author / المطور

**Mjeed Alanazi**

*   Designed with ❤️ for the community.
*   تصميم وتطوير بكل حب للمجتمع.

---

## 📄 License & Terms / الترخيص وشروط الاستخدام

**MIT License**

This project is open source. You are free to use, modify, and distribute it under the following condition:

**Important Note:** You are **strictly prohibited** from removing or changing the original developer's name (**Mjeed Alanazi**). If you modify or redistribute this project, you must keep the original author's credit visible. You may add your name as a modifier/contributor alongside the original name.

**تنبيه هام:** يمنع منعاً باتاً تغيير أو إزالة اسم المطور الأصلي (**Mjeed Alanazi**). في حال قمت بتعديل أو إعادة نشر هذا المشروع، يجب عليك الإبقاء على اسم المطور الأصلي ظاهراً. يمكنك إضافة اسمك كمعدل أو مساهم بجانب الاسم الأصلي، ولكن لا يحق لك حذف المصدر الأساسي.
