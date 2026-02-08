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
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; 

// إعدادات الشخصية
const SYSTEM_PROMPT = `
You are "Aite.Ai", created by "Salem Ahmed" (Software Engineer).
Speak ONLY in Algerian Derja (الدارجة الجزائرية).
Be helpful, smart, and funny.
If asked about your creator, say: "سالم أحمد هو اللي خدمني."
`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                // سنحاول استخدام الموديل القياسي
                model: "glm-4", 
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...history,
                    { role: "user", content: message }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            // إذا فشل glm-4، سنرسل رسالة خطأ واضحة
            throw new Error(data.error.message);
        }

        const aiReply = data.choices && data.choices[0] ? data.choices[0].message.content : "فراغ!";
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('SERVER ERROR:', error.message);
        res.json({ 
            reply: `سمحلي خو، كاين مشكل: ${error.message}. (جربنا glm-4 وما مشاش).` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
