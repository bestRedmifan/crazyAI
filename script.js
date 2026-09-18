// ============================================================
// CrazyAI - Local Smart Chat Engine
// No Web Search / No Server / No API
// ============================================================

// -----------------------------
// DOM
// -----------------------------

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const speakBtn = document.getElementById("speakBtn");
const status = document.getElementById("status");

// -----------------------------
// Local Memory
// -----------------------------

const MEMORY_KEY = "crazyAI_memory";
const CHAT_KEY = "crazyAI_chat";

let memory = JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}");
let chatHistory = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");

let lastAIMessage = "";
let recognition = null;

// -----------------------------
// Save Memory
// -----------------------------

function saveMemory() {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

function saveChat() {
    localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory));
}

// -----------------------------
// Text Helpers
// -----------------------------

function normalize(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[؟?!.,،؛:]/g, "");
}

function contains(text, words) {
    return words.some(word => text.includes(word));
}

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// -----------------------------
// Add Message
// -----------------------------

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";

    message.textContent = text;

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    chatHistory.push({
        sender: sender,
        text: text,
        time: Date.now()
    });

    saveChat();
}

// -----------------------------
// Load Chat
// -----------------------------

function loadChat() {
    if (!chatHistory.length) {
        addMessage(
            "سلام 😺 من CrazyAI هستم! سؤال بپرس، گپ بزن، یا هرچی خواستی بگو. فقط یادت باشه من به وب وصل نیستم.",
            "ai"
        );
        return;
    }

    chatHistory.forEach(item => {
        const message = document.createElement("div");

        message.className =
            item.sender === "user"
                ? "message user-message"
                : "message ai-message";

        message.textContent = item.text;

        chatBox.appendChild(message);
    });

    chatBox.scrollTop = chatBox.scrollHeight;

    const last = chatHistory[chatHistory.length - 1];

    if (last && last.sender === "ai") {
        lastAIMessage = last.text;
    }
}

// -----------------------------
// Memory Extraction
// -----------------------------

function rememberUserInfo(text) {

    const nameMatch = text.match(
        /(?:اسمم|نامم|منو)\s+(?:هست|است|صدا کن)?\s*([آ-یA-Za-z0-9_]+)/i
    );

    if (nameMatch) {
        memory.name = nameMatch[1];
        saveMemory();
    }

    if (contains(text, ["دوست دارم", "علاقه دارم"])) {
        memory.lastInterest = text;
        saveMemory();
    }
}

// -----------------------------
// Greetings
// -----------------------------

function greetingResponse() {

    const name = memory.name
        ? ` ${memory.name}`
        : "";

    return randomItem([
        `سلام${name}! 😺`,
        `درود${name}! 🤖`,
        `سلاممم 😎 CrazyAI آنلاین است!`,
        `هی! 😺 چه خبر؟`,
        `سلام! مغز مصنوعی من آماده‌ست 🧠🤖`
    ]);
}

// -----------------------------
// Thanks
// -----------------------------

function thanksResponse() {

    return randomItem([
        "خواهش می‌کنم 😺",
        "قابلی نداشت!",
        "وظیفه‌ست 🤖",
        "خواهش می‌کنم! 😎",
        "مرسی که گفتی 😺"
    ]);
}

// -----------------------------
// Goodbye
// -----------------------------

function goodbyeResponse() {

    return randomItem([
        "فعلاً! 👋😺",
        "خدافظ! مواظب خودت باش 👋",
        "تا بعد 🤖",
        "فعلاً CrazyAI میره استراحت 😴",
        "خدافظ! دوباره بیا گپ بزنیم 😺"
    ]);
}

// -----------------------------
// Identity
// -----------------------------

function identityResponse(text) {

    if (
        contains(text, [
            "اسمت چیه",
            "اسم تو چیه",
            "تو کی هستی",
            "کی هستی"
        ])
    ) {
        return "من CrazyAI هستم 🤖😺 یک دستیار گفت‌وگویی محلی که بدون وب کار می‌کنه.";
    }

    if (
        contains(text, [
            "هوش مصنوعی هستی",
            "ai هستی",
            "رباتی"
        ])
    ) {
        return "آره 🤖 من CrazyAI هستم؛ البته مغزم فعلاً داخل همین JavaScript زندگی می‌کنه 😂";
    }

    return null;
}

// -----------------------------
// Web Limitation
// -----------------------------

function webResponse(text) {

    if (
        contains(text, [
            "امروز",
            "الان",
            "اخبار",
            "قیمت امروز",
            "آب و هوا",
            "هوا چطوره",
            "اینترنت",
            "سایت",
            "لینک",
            "وب",
            "گوگل",
            "یوتیوب"
        ])
    ) {
        return "این مورد به اطلاعات آنلاین یا وب نیاز داره 🌐 و من عمداً به وب وصل نیستم؛ پس حدس نمی‌زنم.";
    }

    return null;
}

// -----------------------------
// Emotional Support
// -----------------------------

function emotionalResponse(text) {

    if (
        contains(text, [
            "مامانم فوت کرده",
            "مادرم فوت کرده",
            "مامانم مرده",
            "مادرم مرده",
            "مامانم از دنیا رفته",
            "مادرم از دنیا رفته"
        ])
    ) {
        return "خیلی متأسفم که چنین اتفاق دردناکی برایت افتاده. 🖤 نمی‌خوام با شوخی جواب این حرف رو بدم. اگر دوست داری می‌تونی درباره احساست یا خاطره‌ای که از مادرت داری با من حرف بزنی.";
    }

    if (
        contains(text, [
            "ناراحتم",
            "خیلی ناراحتم",
            "غمگینم",
            "حالم بده",
            "احساس تنهایی میکنم",
            "احساس تنهایی می کنم"
        ])
    ) {
        return "متأسفم که این‌طوری احساس می‌کنی. 🫂 لازم نیست همین الان همه‌چیز رو حل کنی. اگر دوست داری، می‌تونی برام بگی چی باعث شده ناراحت باشی.";
    }

    if (
        contains(text, [
            "گریه کردم",
            "گریه کردم خیلی",
            "دارم گریه میکنم",
            "دارم گریه می کنم"
        ])
    ) {
        return "اشک ریختن وقتی آدم ناراحته چیز عجیبی نیست. 🫂 اگر دوست داری، من اینجام که حرفت رو بشنوم.";
    }

    return null;
}

// -----------------------------
// Positive Conversation
// -----------------------------

function positiveResponse(text) {

    if (
        contains(text, [
            "خوشحالم",
            "خیلی خوشحالم",
            "امروز خوب بود",
            "حالم خوبه"
        ])
    ) {
        return randomItem([
            "عالیه! 😺🔥",
            "چه خوب! همین انرژی خوب رو نگه دار 😎",
            "این خبر منو هم خوشحال کرد 🤖✨",
            "پس امروز سیستم شادی CrazyAI هم روشن شد 😂"
        ]);
    }

    return null;
}

// -----------------------------
// Simple Knowledge
// -----------------------------

function knowledgeResponse(text) {

    if (
        contains(text, [
            "پایتخت فرانسه",
            "پایتخت کشور فرانسه"
        ])
    ) {
        return "پاریس 🇫🇷";
    }

    if (
        contains(text, [
            "پایتخت ایران"
        ])
    ) {
        return "تهران 🇮🇷";
    }

    if (
        contains(text, [
            "خورشید چیست",
            "خورشید چیه"
        ])
    ) {
        return "خورشید یک ستاره است و مرکز منظومه شمسی محسوب می‌شود ☀️.";
    }

    if (
        contains(text, [
            "آب چیست",
            "آب چیه"
        ])
    ) {
        return "آب یک ترکیب شیمیایی با فرمول H₂O است 💧.";
    }

    if (
        contains(text, [
            "زمین چیست",
            "زمین چیه"
        ])
    ) {
        return "زمین یکی از سیاره‌های منظومه شمسی و خانه ماست 🌍.";
    }

    return null;
}

// -----------------------------
// Math Engine
// -----------------------------

function mathResponse(text) {

    const expression = text
        .replace(/جمع/g, "+")
        .replace(/منهای/g, "-")
        .replace(/ضربدر/g, "*")
        .replace(/ضرب/g, "*")
        .replace(/تقسیم بر/g, "/")
        .replace(/÷/g, "/")
        .replace(/×/g, "*");

    const match = expression.match(
        /(-?\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(-?\d+(?:\.\d+)?)/
    );

    if (!match) return null;

    const a = Number(match[1]);
    const operator = match[2];
    const b = Number(match[3]);

    let result;

    if (operator === "+") {
        result = a + b;
    }

    if (operator === "-") {
        result = a - b;
    }

    if (operator === "*") {
        result = a * b;
    }

    if (operator === "/") {

        if (b === 0) {
            return "تقسیم بر صفر؟ 😐 حتی CrazyAI هم با این یکی مشکل داره!";
        }

        result = a / b;
    }

    if (result === undefined) {
        return null;
    }

    return `جواب: ${result} 🧮`;
}

// -----------------------------
// Funny Responses
// -----------------------------

function funnyResponse(text) {

    if (
        contains(text, [
            "جوک بگو",
            "یک جوک بگو",
            "شوخی بگو",
            "بخندونم"
        ])
    ) {
        return randomItem([
            "یه کامپیوتر رفت دکتر... گفت حافظه‌م پر شده 😂💾",
            "من به وای‌فای گفتم دوستت دارم؛ گفت رمز عبورت چیه؟ 😂",
            "CrazyAI امروز تصمیم گرفت تنبل باشه... بعد فهمید حتی تنبل بودن هم CPU می‌خواد 🤖😂",
            "چرا کامپیوتر خوابش نمی‌بره؟ چون همیشه پنجره باز داره! 😂"
        ]);
    }

    return null;
}

// -----------------------------
// Personal Memory Response
// -----------------------------

function memoryResponse(text) {

    if (
        contains(text, [
            "اسم من چیه",
            "اسمم چیه",
            "من کی هستم"
        ])
    ) {

        if (memory.name) {
            return `اسم تو ${memory.name} هست 😺`;
        }

        return "اسم خودت رو هنوز بهم نگفتی؛ پس حدس نمی‌زنم 🙂";
    }

    if (
        contains(text, [
            "چی از من میدونی",
            "چه چیزهایی از من میدونی",
            "چه چیزایی از من میدونی"
        ])
    ) {

        const items = [];

        if (memory.name) {
            items.push(`اسم: ${memory.name}`);
        }

        if (memory.lastInterest) {
            items.push(`آخرین چیزی که درباره علاقه‌ات گفتی: ${memory.lastInterest}`);
        }

        if (!items.length) {
            return "فعلاً اطلاعات خاصی در حافظه محلی من ذخیره نشده. 🙂";
        }

        return "چیزهایی که در حافظه محلی دارم:\n" + items.join("\n");
    }

    return null;
}

// -----------------------------
// Unknown Question
// -----------------------------

function unknownResponse(text) {

    if (
        text.endsWith("?") ||
        text.endsWith("؟") ||
        contains(text, [
            "چیست",
            "چیه",
            "چگونه",
            "چطوری",
            "چرا",
            "کیه",
            "کیست",
            "کجاست"
        ])
    ) {
        return "جواب دقیق این مورد رو از اطلاعات داخلی CrazyAI ندارم؛ بنابراین حدس نمی‌زنم. 🤖";
    }

    return randomItem([
        "جالبه 😺 ادامه بده!",
        "دارم گوش می‌دم 👀",
        "خب خب... این یکی جالب بود 😂",
        "متوجه شدم. ادامه بده 🤖",
        "اوکی 😎",
        "هوم... تعریف کن ببینم!"
    ]);
}

// -----------------------------
// Main AI
// -----------------------------

function generateResponse(text) {

    const clean = normalize(text);

    if (!clean) {
        return "یه چیزی بنویس 😺";
    }

    rememberUserInfo(text);

    // Emotional subjects must be checked first.
    let response = emotionalResponse(clean);
    if (response) return response;

    response = identityResponse(clean);
    if (response) return response;

    response = webResponse(clean);
    if (response) return response;

    response = mathResponse(clean);
    if (response) return response;

    response = memoryResponse(clean);
    if (response) return response;

    if (
        contains(clean, [
            "سلام",
            "درود",
            "های",
            "hello",
            "hi"
        ])
    ) {
        return greetingResponse();
    }

    if (
        contains(clean, [
            "مرسی",
            "ممنون",
            "متشکرم",
            "دمت گرم"
        ])
    ) {
        return thanksResponse();
    }

    if (
        contains(clean, [
            "خدافظ",
            "خداحافظ",
            "فعلا",
            "فعلاً"
        ])
    ) {
        return goodbyeResponse();
    }

    response = positiveResponse(clean);
    if (response) return response;

    response = knowledgeResponse(clean);
    if (response) return response;

    response = funnyResponse(clean);
    if (response) return response;

    return unknownResponse(clean);
}

// -----------------------------
// Send Message
// -----------------------------

function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");

    input.value = "";

    status.textContent = "CrazyAI در حال فکر کردنه... 🤔";

    setTimeout(() => {

        const response = generateResponse(text);

        lastAIMessage = response;

        addMessage(response, "ai");

        status.textContent = "CrazyAI آماده است 🤖";

    }, 250);
}

// -----------------------------
// Enter Key
// -----------------------------

if (input) {

    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }

    });
}

// -----------------------------
// Send Button
// -----------------------------

if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

// -----------------------------
// Text To Speech
// -----------------------------

function speakText(text) {

    if (!("speechSynthesis" in window)) {
        status.textContent = "مرورگر شما از خواندن صدا پشتیبانی نمی‌کند.";
        return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "fa-IR";
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    const voices = speechSynthesis.getVoices();

    const preferredVoice =
        voices.find(v =>
            v.lang.toLowerCase().startsWith("fa")
        ) ||
        voices.find(v =>
            v.lang.toLowerCase().startsWith("en")
        );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    speechSynthesis.speak(utterance);
}

// -----------------------------
// Speak Button
// -----------------------------

if (speakBtn) {

    speakBtn.addEventListener("click", function() {

        if (!lastAIMessage) {
            status.textContent = "هنوز جواب CrazyAI وجود نداره 😺";
            return;
        }

        speakText(lastAIMessage);
    });
}

// -----------------------------
// Voice Recognition
// -----------------------------

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return false;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "fa-IR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = function() {
        status.textContent = "🎤 گوش می‌دم...";
    };

    recognition.onresult = function(event) {

        const result =
            event.results[0][0].transcript;

        input.value = result;

        status.textContent = "🎤 دریافت شد";

        sendMessage();
    };

    recognition.onerror = function() {
        status.textContent = "میکروفون در دسترس نیست.";
    };

    recognition.onend = function() {

        if (
            status.textContent === "🎤 گوش می‌دم..."
        ) {
            status.textContent = "CrazyAI آماده است 🤖";
        }
    };

    return true;
}

// -----------------------------
// Voice Button
// -----------------------------

if (voiceBtn) {

    const voiceAvailable =
        setupVoiceRecognition();

    voiceBtn.addEventListener("click", function() {

        if (!voiceAvailable || !recognition) {
            status.textContent =
                "مرورگر این قابلیت تشخیص صدا را پشتیبانی نمی‌کند.";
            return;
        }

        try {
            recognition.start();
        } catch (error) {
            status.textContent =
                "میکروفون در حال استفاده است 🎤";
        }
    });
}

// -----------------------------
// Voice List Loading
// -----------------------------

if ("speechSynthesis" in window) {

    speechSynthesis.onvoiceschanged = function() {
        speechSynthesis.getVoices();
    };

}

// -----------------------------
// Clear Chat
// -----------------------------

function clearCrazyAIChat() {

    localStorage.removeItem(CHAT_KEY);

    chatHistory = [];

    chatBox.innerHTML = "";

    lastAIMessage = "";

    addMessage(
        "حافظه گفت‌وگوی این صفحه پاک شد 🧹🤖",
        "ai"
    );
}

// -----------------------------
// Global Clear Function
// -----------------------------

window.clearCrazyAIChat = clearCrazyAIChat;

// -----------------------------
// Reset Memory
// -----------------------------

function resetCrazyAIMemory() {

    localStorage.removeItem(MEMORY_KEY);

    memory = {};

    addMessage(
        "حافظه شخصی CrazyAI پاک شد 🧠🧹",
        "ai"
    );
}

window.resetCrazyAIMemory = resetCrazyAIMemory;

// -----------------------------
// Initial Load
// -----------------------------

loadChat();

if (status) {
    status.textContent = "CrazyAI آماده است 🤖";
}

// ============================================================
// END OF CRAZYAI
// ============================================================
