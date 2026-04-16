const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors()); // للسماح لصفحة الـ HTML الخاصة بك بالاتصال بالخادم
app.use(express.json());

// متغير لحفظ الجلسة (Cookie) في ذاكرة الخادم
let currentSessionCookie = '';

// 1. مسار (Endpoint) لتسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        // هنا نضع الرابط الفعلي لتسجيل الدخول في الموقع الحكومي
        const loginUrl = 'https://smc.smcegy.com/smc/Home/Login'; 
        
        // بيانات الدخول (يجب تعديلها لتطابق الحقول المطلوبة في الموقع)
        const loginData = {
            username: req.body.username,
            password: req.body.password
        };

        const response = await axios.post(loginUrl, loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // أو application/json حسب برمجة الموقع
            }
        });

        // استخراج الـ Cookie من رد الموقع الحكومي وحفظه
        if (response.headers['set-cookie']) {
            currentSessionCookie = response.headers['set-cookie'].join('; ');
            res.json({ success: true, message: 'تم تسجيل الدخول وجلب الجلسة بنجاح!' });
        } else {
            res.status(401).json({ success: false, message: 'فشل في جلب الجلسة من الموقع.' });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. مسار (Endpoint) لجلب البيانات من الصفحات الداخلية
app.get('/api/fetch-data', async (req, res) => {
    try {
        const targetUrl = req.query.url; // الرابط الذي تريد فتحه (مثل الاستعلام عن مريض)

        if (!currentSessionCookie) {
            return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً!' });
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'Cookie': currentSessionCookie // إرسال الجلسة المحفوظة لتخطي صفحة الدخول
            }
        });

        // إعادة محتوى الصفحة إلى بوابتك
        res.send(response.data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل بنجاح على المنفذ ${PORT}`);
});