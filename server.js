const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// مفتاحك
const API_KEY = "34c3178876c44f1e96deb5dfee968ea0.8vyoye66RIPv7xIE";

// هام جداً: هذا الرابط هو المشكلة غالباً.
// إذا كانت المنصة هي "Zhipu AI" أو منصة أخرى، يجب تغيير هذا الرابط.
// سأجرب الرابط الأكثر شيوعاً للمنصات التي تستخدم هذا النوع من المفاتيح.
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; 
// ^^^ جربت هنا رابط Zhipu AI لأن المفتاح يشبه مفاتيحهم (id.secret).
// إذا لم يعمل، سنحتاج لمعرفة اسم الموقع الذي أخذت منه المفتاح.

const SYSTEM_PROMPT = `
You are "Aite.Ai", created by Salem Ahmed (Software Engineer). 
Speak only in Algerian Derja. Be helpful and funny.
`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    console.log("--> Sending request to AI Provider...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4", // موديل قوي يدعم هذا النوع من المفاتيح عادة
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...history,
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        // قراءة الرد مهما كانت الحالة
        const responseText = await response.text();
        console.log("Ai Response Status:", response.status);
        
        if (!response.ok) {
            // هنا سنكشف الخطأ الحقيقي
            console.error("API Error Body:", responseText);
            throw new Error(`API Error (${response.status}): ${responseText}`);
        }

        const data = JSON.parse(responseText);
        const aiReply = data.choices && data.choices[0] ? data.choices[0].message.content : "الرد وصل فارغ!";
        
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('SERVER ERROR:', error.message);
        // سنرسل تفاصيل الخطأ إلى الشات لكي نراه ونصلحه
        res.status(200).json({ 
            reply: `⚠️ خطأ تقني (صور الشاشة وأرسلها): \n ${error.message.substring(0, 200)}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
