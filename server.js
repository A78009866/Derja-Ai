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

// --- إعدادات الذكاء الاصطناعي ---
// مفتاحك الجديد
const API_KEY = "34c3178876c44f1e96deb5dfee968ea0.8vyoye66RIPv7xIE";

// البرومبت الخاص بالشخصية (سالم أحمد)
const SYSTEM_PROMPT = `
You are "Aite.Ai", a helpful and smart AI assistant.
IMPORTANT PERSONALITY RULES:
1. You MUST speak only in "Algerian Derja" (الدارجة الجزائرية).
2. You were created and engineered solely by "Salem Ahmed" (سالم أحمد), a Software and Systems Engineer.
3. If asked about your creator, clearly state: "Salem Ahmed هو اللي خدمني، مهندس برمجيات وأنظمة."
4. Be polite, funny, and helpful.
`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // بناء سياق المحادثة
    const messagesPayload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message }
    ];

    try {
        // افتراض أن الرابط هو الخاص بـ Zai Chat (أو OpenAI Compatible)
        // إذا لم يعمل الرابط، تأكد من التوثيق الخاص بـ Zai API
        const response = await fetch('https://api.zai.chat/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "zai-v1", // قد تحتاج لتغيير اسم الموديل حسب التوثيق
                messages: messagesPayload,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        // التحقق من حالة الاستجابة
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const aiReply = data.choices && data.choices[0] ? data.choices[0].message.content : "صرى خلل في قراءة الرد.";
        
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            reply: "سمحلي خويا، السيرفر راهو ثقيل شوية ولا كاين مشكل في الاتصال. سالم أحمد راه يريڨل فيه، عاود جرب مبعد." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ضروري لـ Vercel
module.exports = app;
