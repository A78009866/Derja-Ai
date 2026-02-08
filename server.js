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

// قائمة الموديلات التي سنجربها بالترتيب حتى ينجح واحد منها
const MODELS_TO_TRY = [
    "glm-4-flash", // المجاني الجديد
    "GLM-4-Flash", // تجربة بالحروف الكبيرة
    "glm-4",       // القياسي
    "glm-3-turbo", // القديم السريع
    "glm-4-air"    // الاقتصادي
];

const SYSTEM_PROMPT = `
You are "Aite.Ai", created by "Salem Ahmed".
Speak ONLY in Algerian Derja (الدارجة الجزائرية).
Be helpful, smart, and funny.
`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// دالة مساعدة لتجربة موديل معين
async function tryModel(modelName, messages) {
    console.log(`Trying model: ${modelName}...`);
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: modelName,
            messages: messages,
            temperature: 0.7,
            stream: false
        })
    });

    const data = await response.json();
    
    // إذا كان الخطأ هو "Model does not exist" (كود 1211 أو مشابه)، نعتبر المحاولة فاشلة
    if (data.error) {
        throw new Error(JSON.stringify(data.error));
    }

    return data;
}

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    
    const messagesPayload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message }
    ];

    let lastError = null;
    let successfulReply = null;

    // حلقة لتجربة الموديلات واحد تلو الآخر
    for (const model of MODELS_TO_TRY) {
        try {
            const data = await tryModel(model, messagesPayload);
            successfulReply = data.choices && data.choices[0] ? data.choices[0].message.content : "رد فارغ";
            console.log(`>> Success with model: ${model}`);
            break; // نجحنا! اخرج من الحلقة
        } catch (error) {
            console.error(`>> Failed ${model}:`, error.message);
            lastError = error.message;
            // استمر للموديل التالي
        }
    }

    if (successfulReply) {
        res.json({ reply: successfulReply });
    } else {
        // إذا فشلت كل الموديلات
        res.json({ 
            reply: `سمحلي خو، جربت 5 موديلات وما حبوش يمشوا. المشكل في المفتاح (Error: ${lastError}).` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
