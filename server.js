const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path'); // 1. استدعاء مكتبة المسارات

const app = express();
const PORT = process.env.PORT || 3000; // مهم لـ Vercel

app.use(cors());
app.use(bodyParser.json());

// 2. إصلاح مسار المجلد public ليقرأه Vercel بشكل صحيح
app.use(express.static(path.join(__dirname, 'public')));

// إعدادات الـ API
const ZAI_API_KEY = "34c3178876c44f1e96deb5dfee968ea0.8vyoye66RIPv7xIE"; 
const SYSTEM_PROMPT = `
انت ذكاء اصطناعي جزائري "Aite.Ai".
تتكلم فقط بالدارجة الجزائرية وبطريقة عفوية وشابة.
معلومة مهمة جداً ولازم تذكرها لما يسألوك: اللي صنعك وبرمجك هو "سالم أحمد" (Salem Ahmed)، وهو مهندس برمجيات وأنظمة (Software and Systems Engineer).
لا تخرج عن هاد الشخصية ابدا. جاوب بذكاء واحترافية لكن بالدارجة.
`;

// 3. إضافة هذا المسار (Route) هو الحل لمشكلة Cannot GET /
// يخبر السيرفر: "عندما يطلب أحد الصفحة الرئيسية، أعطه index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    const messagesPayload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history, 
        { role: "user", content: message }
    ];

    try {
        const response = await fetch('https://api.zai.chat/v1/chat/completions', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "zai-model-v1", 
                messages: messagesPayload,
                temperature: 0.7
            })
        });

        const data = await response.json();
        const aiReply = data.choices && data.choices[0] ? data.choices[0].message.content : "اسمحلي خوية، كاين مشكل في الاتصال بالسيرفر.";
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Error:', error);
        res.json({ reply: "واش خو! راني هنا، بصح كاين خلل تقني صغير. سالم أحمد راه يريڨل فيه." });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// تصدير التطبيق لـ Vercel
module.exports = app;
