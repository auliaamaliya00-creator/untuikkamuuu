(() => {
  const PIN = "150926";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const intro = $("#intro"), pinScreen = $("#pinScreen"), app = $("#app");
  const field = $("#butterflyField"), title = $("#tlTitle"), enter = $("#enterWorld");
  let pin = "", currentPage = "home", audioCtx = null, masterGain = null, musicTimer = null, musicOn = false, noteIndex = 0;

  // Neon butterflies drift in one by one, then reveal T & L.
  const positions = [
    ["16%","24%","120px","-20px","-12deg"],["65%","18%","-90px","40px","18deg"],
    ["31%","48%","85px","-35px","24deg"],["77%","54%","-100px","-25px","-18deg"],
    ["46%","16%","-35px","90px","15deg"],["22%","72%","130px","-10px","-20deg"],
    ["72%","76%","-120px","-55px","10deg"],["49%","62%","25px","-80px","-10deg"],
    ["37%","31%","-60px","55px","20deg"],["58%","38%","65px","35px","-18deg"],
    ["15%","51%","70px","-70px","10deg"],["83%","34%","-130px","30px","-25deg"]
  ];
  const butterflies = ["🦋","✧","🦋","🦋","✦","🦋","🦋","🦋","✧","🦋","🦋","🦋"];
  positions.forEach((p,i) => {
    const el = document.createElement("span");
    el.className = "butterfly " + (i%3===1 ? "blue" : "");
    el.textContent = butterflies[i];
    el.style.left = p[0]; el.style.top = p[1];
    el.style.setProperty("--tx",p[2]); el.style.setProperty("--ty",p[3]); el.style.setProperty("--rot",p[4]);
    el.style.animationDelay = `${i*.27}s`;
    field.appendChild(el);
  });
  setTimeout(() => { title.classList.add("show"); enter.hidden = false; }, 4300);
  enter.addEventListener("click", () => {
    intro.classList.add("hidden"); pinScreen.classList.remove("hidden");
    // Start dreamy instrumental only after a user gesture (browser audio policy).
    startMusic();
  });

  function renderPin() {
    $$("#pinDots span").forEach((el,i) => {
      el.textContent = i < pin.length ? "♥" : "♡";
      el.classList.toggle("filled", i < pin.length);
    });
  }
  function showPinMessage(message, error=false) {
    const el = $("#pinMessage"); el.textContent = message; el.classList.toggle("error",error);
  }
  function tryPin() {
    if (pin.length !== 6) { showPinMessage("Isi 6 angka dulu yaa, sayanggg ♡",true); return; }
    if (pin === PIN) {
      showPinMessage("Yeayyy, berhasil! Sebentar yaa… ♡");
      pinScreen.classList.add("hidden"); app.classList.remove("hidden");
      showPage("home");
      startMusic();
      toast("Welcome to our little world, gantenggg! ♡");
    } else {
      pin = ""; renderPin(); showPinMessage("Eitss, PIN-nya belum tepat. Coba lagi, sayanggg ♡",true);
    }
  }
  $("#keypad").addEventListener("click", e => {
    const btn = e.target.closest("button[data-key]"); if(!btn) return;
    const key = btn.dataset.key;
    if (key === "clear") { pin = pin.slice(0,-1); renderPin(); showPinMessage("Okeee, coba lagi yaa ♡"); }
    else if (key === "enter") tryPin();
    else if (pin.length < 6) { pin += key; renderPin(); showPinMessage(pin.length===6 ? "Udah 6 angka! Tekan tombol masuk yaa ♡" : ""); if(pin.length===6) setTimeout(()=>{},0); }
  });

  function showPage(page) {
    if (!$("#"+page)) return;
    currentPage = page;
    $$(".page").forEach(p=>p.classList.toggle("active",p.id===page));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  $$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
  $$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.go)));

  const messages = {
    pep: ["Kamu udah berusaha sejauh ini, gantenggg. Istirahat juga bagian dari berjuang, yaa. ♡","Pelan-pelan aja, sayang. Kamu nggak harus punya semua jawabannya hari ini. 🌷","Aku harap kamu bangga sama dirimu sendiri, walau cuma untuk satu hal kecil hari ini. 💗"],
    quote: ["Reminder: kamu pantas dapat istirahat, perhatian, dan hal-hal baik. ♡","Hari berat bukan berarti kamu gagal. Besok masih ada kesempatan baru, gantenggg.","Kalau hari ini belum sempurna, nggak apa-apa. Kamu tetap berharga."],
    joke: ["Meong meong! 🐱 Kucing ini menyuruh gantenggg senyum sekarang juga. Ini perintah dari Yang Mulia Kucing!","Kucingnya bilang: 'sayanggg, jangan cemberut. Nanti aku tagih 3 senyuman dan 1 elusan.' ฅ^•ﻌ•^ฅ","Breaking news: seorang gantenggg ketahuan terlalu ganteng. Warga kucing meminta dia istirahat cukup."],
    random: ["Misi rahasia: kirim satu senyuman kecil sekarang. Berhasil? Hadiahmu adalah 1000 poin sayang. ♡","Tebak siapa yang lagi bikin web lucu ini? Clue: orang yang suka manggil kamu gantenggg. Hehehe.","Pilih hadiah imajiner: 🎂 kue, 🧸 boneka, atau 💗 100 peluk virtual. Semuanya buat kamu!"]
  };
  let activeMessages = [];
  function pickMessage(type) {
    const arr = messages[type]; activeMessages = arr; return arr[Math.floor(Math.random()*arr.length)];
  }
  $$(".mission-card").forEach(btn=>btn.addEventListener("click",()=>{
    $("#missionResult").textContent = pickMessage(btn.dataset.mission);
    $("#missionResult").classList.remove("hidden");
  }));
  $("#anotherMessage").addEventListener("click",()=>{
    const keys=Object.keys(messages), key=keys[Math.floor(Math.random()*keys.length)];
    $("#missionResult").textContent=pickMessage(key);
  });

  $("#giftButton").addEventListener("click",()=>{
    $("#giftMessage").classList.remove("hidden");
    $("#giftButton").classList.add("hidden");
    toast("Hadiah kecil terbuka! Buat gantenggg ♡");
    burstHearts();
  });

  function toast(text) {
    const el=$("#toast"); el.textContent=text; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600);
  }
  function burstHearts() {
    for(let i=0;i<18;i++){
      const h=document.createElement("span"); h.textContent=["♡","♥","✦","🦋"][i%4];
      h.style.cssText=`position:fixed;z-index:40;left:${45+Math.random()*10}%;top:${45+Math.random()*10}%;color:${i%2?"#f27fa8":"#b7a5ff"};font-size:${16+Math.random()*20}px;pointer-events:none;animation:heartBurst 1.7s ease-out forwards`;
      document.body.appendChild(h); setTimeout(()=>h.remove(),1800);
    }
  }
  const style=document.createElement("style"); style.textContent="@keyframes heartBurst{to{transform:translate("+ "var(--x, 60px)" + ",-120px) scale(.4);opacity:0}}"; document.head.appendChild(style);

  // A gentle dreamy chime pad made with Web Audio; no external audio file required.
  // Browsers only allow playback after a tap/click. Music starts softly and can be adjusted.
  function startMusic() {
    if (musicOn) return;
    try {
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) { $("#musicLabel").textContent="Audio tak tersedia"; return; }
      audioCtx = audioCtx || new AC();
      if(audioCtx.state==="suspended") audioCtx.resume();
      masterGain = masterGain || audioCtx.createGain();
      masterGain.gain.value = 0.055; // soft background level; user can raise it via the music control
      if(!masterGain.connected){ masterGain.connect(audioCtx.destination); masterGain.connected=true; }
      musicOn=true; $("#musicToggle").classList.add("playing"); $("#musicLabel").textContent="Musik ON";
      const scale=[261.63,329.63,392.00,493.88,392.00,329.63,293.66,349.23];
      let n=0;
      musicTimer=setInterval(()=>{
        if(!musicOn||!audioCtx) return;
        const now=audioCtx.currentTime;
        const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
        osc.type="sine"; osc.frequency.value=scale[n%scale.length]*(n%4===0?2:1);
        gain.gain.setValueAtTime(0.0001,now); gain.gain.exponentialRampToValueAtTime(0.18,now+.08); gain.gain.exponentialRampToValueAtTime(0.0001,now+1.25);
        osc.connect(gain); gain.connect(masterGain); osc.start(now); osc.stop(now+1.3);
        if(n%4===0){
          const pad=audioCtx.createOscillator(), pg=audioCtx.createGain();
          pad.type="triangle"; pad.frequency.value=scale[(n+2)%scale.length]/2;
          pg.gain.setValueAtTime(.0001,now); pg.gain.exponentialRampToValueAtTime(.045,now+.25); pg.gain.exponentialRampToValueAtTime(.0001,now+2.4);
          pad.connect(pg); pg.connect(masterGain); pad.start(now); pad.stop(now+2.5);
        }
        n++;
      },620);
    } catch(e) { $("#musicLabel").textContent="Musik siap"; }
  }
  function stopMusic() {
    musicOn=false; if(musicTimer) clearInterval(musicTimer); musicTimer=null;
    if(masterGain && audioCtx) { try { masterGain.gain.setTargetAtTime(0,audioCtx.currentTime,.08); } catch(e){} }
    $("#musicToggle").classList.remove("playing"); $("#musicLabel").textContent="Musik OFF";
  }
  $("#musicToggle").addEventListener("click",()=>{
    if(musicOn) stopMusic();
    else {
      if(masterGain && audioCtx) { try { masterGain.gain.setTargetAtTime(.055,audioCtx.currentTime,.1); } catch(e){} }
      startMusic();
    }
  });
  // Expose a quick volume adjustment by long-pressing the music button.
  $("#musicToggle").addEventListener("contextmenu",e=>{
    e.preventDefault(); if(!masterGain||!audioCtx) startMusic();
    if(masterGain) { masterGain.gain.value=.11; $("#musicLabel").textContent="Volume ↑"; toast("Volume musik dinaikkan ♫"); }
  });
  // Tap the music button while holding it on touch screens to raise the volume.
  let holdTimer;
  $("#musicToggle").addEventListener("touchstart",()=>{holdTimer=setTimeout(()=>{if(masterGain){masterGain.gain.value=.11;$("#musicLabel").textContent="Volume ↑";toast("Volume musik dinaikkan ♫");}},650)},{passive:true});
  ["touchend","touchmove","touchcancel"].forEach(ev=>$("#musicToggle").addEventListener(ev,()=>clearTimeout(holdTimer),{passive:true}));
})();