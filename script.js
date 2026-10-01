// CrazyAI - API edition
const chatArea=document.getElementById("chatArea");
const input=document.getElementById("messageInput");
const composer=document.getElementById("composer");
const sendBtn=document.getElementById("sendBtn");
const voiceBtn=document.getElementById("voiceBtn");
const clearBtn=document.getElementById("clearBtn");
const typing=document.getElementById("typing");
const statusText=document.getElementById("statusText");
const voiceStatus=document.getElementById("voiceStatus");
const toast=document.getElementById("toast");
const MEMORY_KEY="crazyAI_memory",CHAT_KEY="crazyAI_chat";
let memory={},chatHistory=[],lastAIMessage="",recognition=null,isListening=false,voiceAvailable=false;
function readJSON(k,f){try{let r=localStorage.getItem(k);return r?JSON.parse(r):f}catch(e){return f}}
memory=readJSON(MEMORY_KEY,{});chatHistory=readJSON(CHAT_KEY,[]);
if(!memory||typeof memory!=="object"||Array.isArray(memory))memory={};
if(!Array.isArray(chatHistory))chatHistory=[];
function saveMemory(){try{localStorage.setItem(MEMORY_KEY,JSON.stringify(memory))}catch(e){}}
function saveChat(){try{localStorage.setItem(CHAT_KEY,JSON.stringify(chatHistory))}catch(e){}}
function showToast(m){if(!toast)return;toast.textContent=m;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200)}
function setStatus(m){if(statusText)statusText.textContent=m}
function showTyping(){if(typing)typing.style.display="flex";setStatus("CrazyAI در حال فکر کردن است...")}
function hideTyping(){if(typing)typing.style.display="none";setStatus("آماده")}
function normalize(t){return String(t).toLowerCase().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").trim()}
function clean(t){return normalize(t).replace(/[؟?!.,،؛:]/g,"")}
function has(t,w){return w.some(x=>t.includes(x))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function createMessage(t,s){let e=document.createElement("div");e.className=s==="user"?"message user-message":"message ai-message";e.textContent=t;return e}
function addMessage(t,s,save=true){
 if(!chatArea)return;let w=document.getElementById("welcome");if(w)w.remove();
 chatArea.appendChild(createMessage(t,s));chatArea.scrollTop=chatArea.scrollHeight;
 if(save){chatHistory.push({sender:s,text:t,time:Date.now()});saveChat()}
}
function loadChat(){
 if(!chatArea||!chatHistory.length)return;let w=document.getElementById("welcome");if(w)w.remove();
 chatHistory.forEach(x=>{if(x&&typeof x.text==="string")addMessage(x.text,x.sender==="user"?"user":"ai",false)});
 let l=chatHistory[chatHistory.length-1];if(l&&l.sender==="ai")lastAIMessage=l.text
}
function remember(t){
 let p=[/اسمم\s+([آ-یA-Za-z0-9_]+)/i,/نامم\s+([آ-یA-Za-z0-9_]+)/i,/اسم\s+من\s+([آ-یA-Za-z0-9_]+)/i];
 for(let x of p){let m=t.match(x);if(m&&m[1]){memory.name=m[1].trim();saveMemory();break}}
 if(has(clean(t),["دوست دارم","علاقه دارم"])){memory.lastInterest=t;saveMemory()}
}
function greeting(){let n=memory.name?` ${memory.name}`:"";return pick([`سلام${n}! 😺`,`درود${n}! 🤖`,"سلاممم 😎 CrazyAI آنلاین است!","هی! 😺 چه خبر؟","سلام! مغز مصنوعی من آماده‌ست 🧠🤖"])}
function buildWelcome(){
 let s=document.createElement("section");s.className="welcome";s.id="welcome";
 s.innerHTML=`<div class="big-robot">🤖</div><h2>سلام! من CrazyAI هستم 😺</h2><p>هر چیزی خواستی بپرس.</p><div class="suggestions"><button class="suggestion">سلام CrazyAI!</button><button class="suggestion">خودت را معرفی کن</button><button class="suggestion">یک جوک بگو 😂</button><button class="suggestion">۲۵ × ۴ چند می‌شود؟</button></div>`;
 return s
}
function attachSuggestions(){document.querySelectorAll(".suggestion").forEach(b=>b.addEventListener("click",()=>{if(input){input.value=b.textContent.trim();input.dispatchEvent(new Event("input"));sendMessage()}}))}
function clearChat(){chatHistory=[];lastAIMessage="";try{localStorage.removeItem(CHAT_KEY)}catch(e){}if(chatArea){chatArea.innerHTML="";chatArea.appendChild(buildWelcome());attachSuggestions()}if(window.speechSynthesis)speechSynthesis.cancel();hideTyping();showToast("چت پاک شد 🧹🤖")}
function resetMemory(){memory={};try{localStorage.removeItem(MEMORY_KEY)}catch(e){}showToast("حافظه پاک شد 🧠")}

function localReply(t){
 let v=clean(t);
 if(!v)return"یه چیزی بنویس 😺";
 remember(t);
 if(has(v,["اخبار","قیمت امروز","قیمت الان","آب و هوا","هوا چطوره","لینک","سایت","گوگل","یوتیوب","اینترنت","جستجو","سرچ"]))
  return"متأسفم من سرور بک اند و یا دیتا بیس ندارم میتوانید اسکرین شات و یا توضیح راجب وب سایت بگید";
 if(has(v,["اسمت چیه","اسم تو چیه","تو کی هستی","معرفی کن"]))return"من CrazyAI هستم 🤖";
 if(has(v,["سلام","درود","hello","hi"]))return greeting();
 if(has(v,["مرسی","ممنون","متشکرم","دمت گرم"]))return"خواهش می‌کنم 😺";
 if(has(v,["خدافظ","خداحافظ","فعلا","فعلاً"]))return"فعلاً! 👋😺";
 if(has(v,["خوبی","حالت چطوره","چه خبر"]))return"خوبم 😺🤖 آماده‌ام باهات گپ بزنم!";
 if(has(v,["جوک بگو","یه جوک بگو","یک جوک بگو"]))return pick(["یه کامپیوتر رفت دکتر... گفت حافظه‌م پر شده 😂💾","چرا کامپیوتر خوابش نمی‌بره؟ چون همیشه پنجره باز داره! 😂"]);
 let m=v.replace(/به علاوه/g,"+").replace(/جمع/g,"+").replace(/منهای/g,"-").replace(/ضربدر/g,"*").replace(/ضرب/g,"*").replace(/تقسیم بر/g,"/").replace(/تقسیم/g,"/").replace(/×/g,"*").replace(/÷/g,"/");
 let q=m.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/);
 if(q){let a=+q[1],b=+q[3],r=q[2]=="+"?a+b:q[2]=="-"?a-b:q[2]=="*"?a*b:b?a/b:null;return r===null?"تقسیم بر صفر؟ 😐":"جواب: "+r+" 🧮"}
 return null
}

function wantsCode(t){return has(clean(t),["کد بنویس","کدنویسی کن","کد html","کد css","کد js","javascript","python","java","c++","کد نویسی"])}
function wantsSearch(t){return has(clean(t),["سرچ کن","جستجو کن","در اینترنت","اخبار","لینک بده","سایت پیدا کن","گوگل کن"])}
async function askAPI(text,files=[]){
 if(wantsSearch(text))return"متأسفم من سرور بک اند و یا دیتا بیس ندارم میتوانید اسکرین شات و یا توضیح راجب وب سایت بگید";
 let local=localReply(text);if(local)return local;
 if(wantsCode(text)&&text.length>23000)return"درخواست کد بیشتر از 23K character است و نمی‌توانم آن را پردازش کنم.";
 let content=[{type:"input_text",text:text}];
 for(let f of files)content.push({type:"input_image",image_url:f});
 let r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input:[{role:"user",content} ]})});
 let d=await r.json();if(!r.ok)throw Error(d.error||"API error");
 return d.output||"پاسخی دریافت نشد.";
}
async function sendMessage(){
 if(!input)return;let text=input.value.trim();if(!text)return;
 addMessage(text,"user",true);input.value="";input.style.height="auto";if(sendBtn)sendBtn.disabled=true;showTyping();
 try{let answer=await askAPI(text);lastAIMessage=answer;addMessage(answer,"ai",true);speak(answer)}
 catch(e){addMessage("ارتباط با API برقرار نشد. لطفاً دوباره تلاش کن. 🤖","ai",true)}
 hideTyping();if(sendBtn)sendBtn.disabled=false
}
function speak(t){if(!window.speechSynthesis||!t)return;try{speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang="fa-IR";u.rate=.95;u.pitch=.9;speechSynthesis.speak(u)}catch(e){}}
function setupVoice(){
 let SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return;
 try{recognition=new SR();recognition.lang="fa-IR";recognition.continuous=false;recognition.interimResults=false;voiceAvailable=true;
 recognition.onstart=()=>{isListening=true;if(voiceStatus)voiceStatus.textContent="🎤 گوش می‌دم...";if(voiceBtn)voiceBtn.classList.add("listening")};
 recognition.onresult=e=>{let r=e.results?.[0]?.[0]?.transcript?.trim();if(r&&input){input.value=r;sendMessage()}};
 recognition.onend=()=>{isListening=false;if(voiceBtn)voiceBtn.classList.remove("listening");if(voiceStatus)voiceStatus.textContent="برای صحبت کردن روی 🎤 بزن"};
 }catch(e){}
}
if(composer)composer.addEventListener("submit",e=>{e.preventDefault();sendMessage()});
if(input)input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}});
if(input)input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,160)+"px"});
if(clearBtn)clearBtn.addEventListener("click",clearChat);
if(voiceBtn)voiceBtn.addEventListener("click",()=>{if(voiceAvailable&&!isListening)try{recognition.start()}catch(e){}});
window.clearCrazyAIChat=clearChat;window.resetCrazyAIMemory=resetMemory;
window.CrazyAI={version:"2.0-api",ask:q=>askAPI(String(q)),getMemory:()=>memory,getChat:()=>chatHistory,clearChat,resetMemory};
setupVoice();loadChat();attachSuggestions();hideTyping();setStatus("آماده");
if(voiceStatus)voiceStatus.textContent=voiceAvailable?"برای صحبت کردن روی 🎤 بزن":"🎤 تشخیص صدا در این مرورگر در دسترس نیست.";
