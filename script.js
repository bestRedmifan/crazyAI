// ==========================================
// CrazyAI - Main JavaScript
// Chat + Memory + Voice + Funny Personality
// ==========================================

const chatArea = document.getElementById("chatArea");
const welcome = document.getElementById("welcome");
const composer = document.getElementById("composer");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const clearBtn = document.getElementById("clearBtn");
const typing = document.getElementById("typing");
const toast = document.getElementById("toast");
const statusText = document.getElementById("statusText");

const STORAGE_KEY = "crazyai_messages_v1";
const SETTINGS_KEY = "crazyai_settings_v1";

// ==========================================
// API CONFIGURATION
// ==========================================

// IMPORTANT:
// Do not publish a private API key in a public
// GitHub Pages website.
//
// Put your own compatible endpoint here only
// if you have a safe way to protect the key.

const AI_CONFIG = {
  enabled: false,
  endpoint: "",
  model: "",
  apiKey: ""
};

// ==========================================
// State
// ==========================================

let messages = loadMessages();
let recognition = null;
let isListening = false;
let speechVoice = null;

// ==========================================
// Start
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  loadVoices();
  renderMessages();
  setupSpeechRecognition();
  autoResize();
});

if ("speechSynthesis" in window) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

// ==========================================
// LocalStorage
// ==========================================

function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Memory load error:", error);
    return [];
  }
}

function saveMessages() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error("Memory save error:", error);
    showToast("ذخیره حافظه انجام نشد 😿");
  }
}

// ==========================================
// Render chat
// ==========================================

function renderMessages() {
  chatArea.innerHTML = "";

  if (messages.length === 0) {
    chatArea.appendChild(createWelcome());
    return;
  }

  messages.forEach(message => {
    chatArea.appendChild(createMessage(message));
  });

  scrollBottom();
}

function createWelcome() {
  const section = document.createElement("section");

  section.className = "welcome";

  section.innerHTML = `
    <div class="big-robot">🤖</div>
    <h2>سلام! من CrazyAI هستم 😺</h2>
    <p>
      سؤال بپرس؛ جواب درست می‌دم و اگر لازم باشد
      کمی هم چاشنی دیوانگی اضافه می‌کنم 😂
    </p>
  `;

  return section;
}

function createMessage(message) {
  const wrapper = document.createElement("div");

  wrapper.className =
    "message " +
    (message.role === "user" ? "user" : "ai");

  const bubble = document.createElement("div");

  bubble.className = "bubble";

  bubble.textContent = message.content;

  wrapper.appendChild(bubble);

  if (message.role === "assistant") {
    const tools = document.createElement("div");

    tools.className = "ai-tools";

    const speak = document.createElement("button");

    speak.textContent = "🔊 خواندن";

    speak.addEventListener("click", () => {
      speakText(message.content);
    });

    tools.appendChild(speak);
    bubble.appendChild(tools);
  }

  return wrapper;
}

// ==========================================
// Sending
// ==========================================

composer.addEventListener("submit", async event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    return;
  }

  await sendMessage(text);
});

async function sendMessage(text) {
  addMessage("user", text);

  input.value = "";

  autoResize();

  showTyping(true);

  statusText.textContent = "در حال فکر کردن...";

  try {
    let answer;

    if (AI_CONFIG.enabled) {
      answer = await askRealAI(text);
    } else {
      answer = localCrazyBrain(text);
    }

    addMessage("assistant", answer);

    statusText.textContent = "آماده";

  } catch (error) {
    console.error(error);

    addMessage(
      "assistant",
      "اوه! مغزم یه لحظه رفت مرخصی 😵‍💫 دوباره امتحان کن."
    );

    statusText.textContent = "خطا";
  }

  showTyping(false);
}

function addMessage(role, content) {
  const message = {
    id: Date.now() + Math.random(),
    role,
    content,
    time: new Date().toISOString()
  };

  messages.push(message);

  saveMessages();

  renderMessages();
}

// ==========================================
// Real AI API
// ==========================================

async function askRealAI(userText) {
  if (!AI_CONFIG.endpoint) {
    throw new Error("AI endpoint is not configured.");
  }

  const history = messages
    .slice(-20)
    .map(item => ({
      role:
        item.role === "assistant"
          ? "assistant"
          : "user",
      content: item.content
    }));

  const response = await fetch(
    AI_CONFIG.endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization":
          "Bearer " + AI_CONFIG.apiKey
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content:
              "You are CrazyAI. Answer accurately. " +
              "Be serious for serious questions. " +
              "Use light humor only when appropriate. " +
              "Do not pretend to have web access."
          },
          ...history
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "AI request failed: " + response.status
    );
  }

  const data = await response.json();

  return extractAIText(data);
}

function extractAIText(data) {
  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data?.response) {
    return data.response;
  }

  if (data?.text) {
    return data.text;
  }

  throw new Error("Unknown AI response format.");
}

// ==========================================
// Local Crazy Brain
// ==========================================

function localCrazyBrain(text) {
  const q = text.toLowerCase().trim();

  if (
    q === "سلام" ||
    q.includes("سلام crazyai") ||
    q.includes("hello")
  ) {
    return "سلاممم 😺🤖 من CrazyAI هستم! آماده‌ام سؤال‌هات رو جواب بدم. مغزم روشنه... فعلاً!";
  }

  if (
    q.includes("خودت را معرفی") ||
    q.includes("خودتو معرفی") ||
    q.includes("کی هستی")
  ) {
    return "من CrazyAI هستم 🤖؛ یک دستیار چت که می‌تونه جدی جواب بده و گاهی هم یکم دیوانگی چاشنی جوابش کنه 😂";
  }

  if (
    q.includes("جوک") ||
    q.includes("لطیفه")
  ) {
    return "چرا کامپیوتر رفت دکتر؟ چون زیادی ویروس گرفته بود 😂💻";
  }

  const math = solveSimpleMath(q);

  if (math !== null) {
    return "جوابش میشه: " + math + " 🧠";
  }

  if (
    q.includes("حالت چطوره") ||
    q.includes("خوبی")
  ) {
    return "خوبم 😺⚡ البته اگر زیاد سؤال سخت بپرسی، احتمالاً فن مجازی‌ام روشن میشه!";
  }

  if (
    q.includes("ممنون") ||
    q.includes("مرسی")
  ) {
    return "خواهش می‌کنم 😺🤝 وظیفه‌ست!";
  }

  if (
    q.includes("خداحافظ") ||
    q.includes("بای")
  ) {
    return "بای بای 😺👋 مواظب خودت باش!";
  }

  if (
    q.includes("پایتخت فرانسه") ||
    q.includes("capital of france")
  ) {
    return "پاریس 🇫🇷";
  }

  if (
    q.includes("html چیست") ||
    q.includes("html چیه")
  ) {
    return "HTML زبان نشانه‌گذاری برای ساختار صفحات وب است. یعنی اسکلت سایت 🧱🌐";
  }

  if (
    q.includes("javascript چیست") ||
    q.includes("جاوااسکریپت چیست")
  ) {
    return "JavaScript برای اضافه کردن رفتار و تعامل به صفحات وب استفاده می‌شود ⚡";
  }

  return (
    "سؤالت رو دیدم 👀 ولی مغز محلی من برای این سؤال " +
    "دانش کافی نداره. برای جواب واقعی و گسترده، باید " +
    "CrazyAI رو به یک مدل AI واقعی وصل کنیم 🤖🧠"
  );
}

// ==========================================
// Simple calculator
// ==========================================

function solveSimpleMath(text) {
  const normalized = text
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("٬", "")
    .replaceAll(",", "");

  const match = normalized.match(
    /(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/
  );

  if (!match) {
    return null;
  }

  const a = Number(match[1]);
  const operator = match[2];
  const b = Number(match[3]);

  if (operator === "+") {
    return a + b;
  }

  if (operator === "-") {
    return a - b;
  }

  if (operator === "*") {
    return a * b;
  }

  if (operator === "/") {
    if (b === 0) {
      return "تقسیم بر صفر تعریف نشده";
    }

    return a / b;
  }

  return null;
}

// ==========================================
// Voice recognition
// ==========================================

function setupSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.disabled = true;
    voiceStatus.textContent =
      "تشخیص صدا در این مرورگر پشتیبانی نمی‌شود.";
    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "fa-IR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isListening = true;

    voiceBtn.classList.add("listening");

    voiceStatus.textContent =
      "🎙️ دارم گوش می‌دم... صحبت کن!";
  };

  recognition.onresult = event => {
    const result =
      event.results[0][0].transcript;

    input.value = result;

    autoResize();

    voiceStatus.textContent =
      "متوجه شدم 😺";
  };

  recognition.onerror = event => {
    console.error("Speech error:", event.error);

    voiceStatus.textContent =
      "مشکلی در تشخیص صدا پیش آمد.";
  };

  recognition.onend = () => {
    isListening = false;

    voiceBtn.classList.remove("listening");

    setTimeout(() => {
      voiceStatus.textContent =
        "برای صحبت کردن روی 🎤 بزن";
    }, 1200);
  };
}

voiceBtn.addEventListener("click", () => {
  if (!recognition) {
    showToast("تشخیص صدا در این مرورگر نیست.");
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    console.error(error);
  }
});

// ==========================================
// Text to Speech
// ==========================================

function loadVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const voices =
    speechSynthesis.getVoices();

  const persian =
    voices.find(voice =>
      voice.lang.toLowerCase().startsWith("fa")
    );

  const maleWords = [
    "male",
    "man",
    "مرد",
    "مردانه"
  ];

  const male =
    voices.find(voice =>
      maleWords.some(word =>
        voice.name.toLowerCase().includes(word)
      )
    );

  speechVoice = male || persian || voices[0] || null;
}

function speakText(text) {
  if (!("speechSynthesis" in window)) {
    showToast("خواندن صدا پشتیبانی نمی‌شود.");
    return;
  }

  speechSynthesis.cancel();

  const cleanText = text
    .replace(/https?:\/\/\S+/g, "")
    .trim();

  const utterance =
    new SpeechSynthesisUtterance(cleanText);

  utterance.lang = "fa-IR";
  utterance.rate = 0.95;
  utterance.pitch = 0.9;
  utterance.volume = 1;

  if (speechVoice) {
    utterance.voice = speechVoice;
  }

  speechSynthesis.speak(utterance);
}

// ==========================================
// Clear chat
// ==========================================

clearBtn.addEventListener("click", () => {
  if (messages.length === 0) {
    showToast("چتی برای پاک کردن نیست 😺");
    return;
  }

  const confirmed = confirm(
    "همه چت‌های CrazyAI پاک شوند؟"
  );

  if (!confirmed) {
    return;
  }

  messages = [];

  saveMessages();

  speechSynthesis?.cancel();

  renderMessages();

  statusText.textContent = "آماده";

  showToast("حافظه چت پاک شد 🗑️");
});

// ==========================================
// Suggestions
// ==========================================

document.addEventListener("click", event => {
  if (!event.target.classList.contains("suggestion")) {
    return;
  }

  input.value = event.target.textContent;

  autoResize();

  input.focus();
});

// ==========================================
// Typing
// ==========================================

function showTyping(value) {
  typing.classList.toggle("show", value);

  if (value) {
    scrollBottom();
  }
}

// ==========================================
// Scroll
// ==========================================

function scrollBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTop =
      chatArea.scrollHeight;
  });
}

// ==========================================
// Textarea
// ==========================================

input.addEventListener("input", autoResize);

input.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();

    composer.requestSubmit();
  }
});

function autoResize() {
  input.style.height = "auto";

  input.style.height =
    Math.min(input.scrollHeight, 130) + "px";
}

// ==========================================
// Toast
// ==========================================

let toastTimer;

function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ==========================================
// End
// ==========================================
