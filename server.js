const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // لخدمة ملفات الواجهة

// إعدادات الـ API والموديل
const ZAI_API_KEY = "34c3178876c44f1e96deb5dfee968ea0.8vyoye66RIPv7xIE"; // مفتاحك هنا
const SYSTEM_PROMPT = `
انت ذكاء اصطناعي جزائري "Aite.Ai".
تتكلم فقط بالدارجة الجزائرية وبطريقة عفوية وشابة.
معلومة مهمة جداً ولازم تذكرها لما يسألوك: اللي صنعك وبرمجك هو "سالم أحمد" (Salem Ahmed)، وهو مهندس برمجيات وأنظمة (Software and Systems Engineer).
لا تخرج عن هاد الشخصية ابدا. جاوب بذكاء واحترافية لكن بالدارجة.
`;

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // تحضير سياق المحادثة (Context)
    // نقوم بدمج التوجيهات مع المحادثة
    const messagesPayload = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history, // المحادثة السابقة
        { role: "user", content: message }
    ];

    try {
        // ملاحظة: بما أن توثيق Zai API غير متاح للعامة بدقة،
        // هذا كود افتراضي لهيكلية الطلب (Standard POST).
        // قد تحتاج لتعديل الرابط (URL) حسب التوثيق لديهم.
        
        const response = await fetch('https://api.zai.chat/v1/chat/completions', { // تأكد من رابط الـ API الصحيح
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ZAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "zai-model-v1", // أو اسم الموديل الخاص بهم
                messages: messagesPayload,
                temperature: 0.7
            })
        });

        const data = await response.json();

        // افتراض أن الرد يأتي في data.choices[0].message.content
        // عدل هذا السطر إذا كان الرد بهيكلية مختلفة
        const aiReply = data.choices && data.choices[0] ? data.choices[0].message.content : "اسمحلي خوية، كاين مشكل في الاتصال بالسيرفر.";
        
        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Error:', error);
        // رد احتياطي في حالة الخطأ (محاكاة للذكاء الاصطناعي للتجربة)
        res.json({ reply: "واش خو! راني هنا، بصح كاين خلل تقني صغير. سالم أحمد راه يريڨل فيه. عاود جرب دقيقة هكا." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
