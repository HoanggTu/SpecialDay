import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Sparkles, Music2, Type, Image as ImgIcon, Video as VideoIcon, Download, Upload, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

/* ---------------- Helpers ---------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const download = (filename, text) => {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); a.remove(); URL.revokeObjectURL(url);
};

/* -------------- Background toys -------------- */
const Balloons = ({ count = 10 }) => {
  const items = useMemo(() => Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    size: 24 + Math.random() * 36,
    delay: Math.random() * 5,
    duration: 12 + Math.random() * 10,
  })), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((b, i) => (
        <div key={i} className="absolute bottom-[-80px]" style={{ left: `${b.left}%`, animation: `floatY ${b.duration}s linear ${b.delay}s infinite` }}>
          <div className="rounded-full opacity-80"
               style={{ width: b.size, height: b.size, background: `hsl(${(i*47)%360} 90% 65%)`, boxShadow: "0 8px 20px rgba(0,0,0,.15)" }}/>
        </div>
      ))}
      <style>{`@keyframes floatY{from{transform:translateY(0)}to{transform:translateY(-120vh)}}`}</style>
    </div>
  );
};

const Confetti = ({ fire }) => {
  const firedRef = useRef(false);
  useEffect(() => {
    let off = false;
    (async () => {
      if (fire && !firedRef.current) {
        firedRef.current = true;
        try {
          const mod = await import("canvas-confetti");
          if (off) return;
          const confetti = mod.default;
          const burst = (x) => confetti({ particleCount: 80, spread: 70, origin: { x, y: 0.8 } });
          burst(0.2); burst(0.5); burst(0.8);
          setTimeout(()=>burst(0.35),350);
          setTimeout(()=>burst(0.65),550);
        } catch {}
      }
    })();
    return () => { off = true; };
  }, [fire]);
  return null;
};

/* -------------- Animations -------------- */
const transitions = {
  fade:        { initial:{opacity:0},         animate:{opacity:1},          exit:{opacity:0} },
  "slide-l":   { initial:{x:80,  opacity:0},  animate:{x:0,   opacity:1},   exit:{x:-80, opacity:0} },
  "slide-r":   { initial:{x:-80, opacity:0},  animate:{x:0,   opacity:1},   exit:{x:80,  opacity:0} },
  zoom:        { initial:{scale:.92,opacity:0},animate:{scale:1,opacity:1},  exit:{scale:.92,opacity:0} },
  flip:        { initial:{rotateY:90,opacity:0},animate:{rotateY:0,opacity:1},exit:{rotateY:-90,opacity:0},style:{transformStyle:"preserve-3d"} },
};
const effects = {
  none:{ initial:{opacity:0,y:10}, animate:{opacity:1,y:0} },
  bounce:{ initial:{scale:.9,opacity:0}, animate:{scale:1,opacity:1,transition:{type:"spring",bounce:.45}} },
  "fade-up":{ initial:{y:24,opacity:0}, animate:{y:0,opacity:1} },
  "rotate-in":{ initial:{rotate:-8,opacity:0}, animate:{rotate:0,opacity:1} },
};

/* -------------- Defaults -------------- */
const starterSlides = [
  { id: uid(), type: "title",   title: "Happy Birthday!", subtitle: "Chúc mừng sinh nhật 🎉", bg: "gradient-candy", duration: 4, transition: "fade",   effect: "bounce",    balloons:true },
  { id: uid(), type: "message", text: "Chúc bạn tuổi mới luôn vui vẻ, nhiều sức khỏe và đạt mọi ước mơ!",            duration: 6, transition: "slide-l", effect: "fade-up" },
  { id: uid(), type: "image",   imageUrl: "https://images.unsplash.com/photo-1603574670812-d24560880210?q=80&w=1600&auto=format&fit=crop", caption: "Make a wish ✨", duration: 6, transition: "zoom", effect: "none" },
  { id: uid(), type: "outro",   title: "Have a magical day!", duration: 4, transition: "flip", effect: "rotate-in", confetti:true },
];

/* -------------- Slide -------------- */
const Slide = ({ slide, celebrant, theme }) => {
  const t = transitions[slide.transition] || transitions.fade;
  const e = effects[slide.effect] || effects.none;

  const bgClass = (() => {
    switch (slide.bg || theme.background) {
      case "gradient-candy":  return "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500";
      case "gradient-ocean":  return "bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800";
      case "gradient-sunset": return "bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-600";
      case "solid-dark":      return "bg-neutral-900";
      case "solid-light":     return "bg-neutral-100";
      default:                return "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500";
    }
  })();

  return (
    <motion.div
      className={`relative w-full h-full ${bgClass} text-white flex items-center justify-center p-4 sm:p-6`}
      initial={t.initial} animate={t.animate} exit={t.exit} transition={{ duration:.6 }} style={t.style}
    >
      {slide.balloons && <Balloons count={14}/>}
      {slide.confetti && <Confetti fire/>}

      <div className="relative z-10 max-w-5xl text-center drop-shadow-[0_6px_24px_rgba(0,0,0,.35)]">
        {slide.type==="title" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{duration:.6}}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight">
              {slide.title || `Happy Birthday ${celebrant || "🎂"}!`}
            </h1>
            <p className="mt-4 text-lg sm:text-xl md:text-2xl opacity-95">
              {slide.subtitle || "Wishing you all the best"}
            </p>
          </motion.div>
        )}

        {slide.type==="message" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{duration:.6}}>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {celebrant ? `Dear ${celebrant},` : "Lời chúc"}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed">{slide.text}</p>
          </motion.div>
        )}

        {slide.type==="image" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{duration:.6}}>
            {slide.imageUrl
              ? <img src={slide.imageUrl} alt="slide" className="mx-auto max-h-[60vh] w-auto rounded-2xl shadow-2xl"/>
              : <div className="p-12 rounded-2xl bg-white/15">(Add an image URL)</div>}
            {slide.caption && <p className="mt-4 text-lg sm:text-xl md:text-2xl">{slide.caption}</p>}
          </motion.div>
        )}

        {slide.type==="video" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{duration:.6}}>
            {slide.videoUrl
              ? <video src={slide.videoUrl} className="mx-auto max-h-[60vh] w-auto rounded-2xl shadow-2xl" controls/>
              : <div className="p-12 rounded-2xl bg-white/15">(Add a video URL)</div>}
            {slide.caption && <p className="mt-4 text-lg sm:text-xl md:text-2xl">{slide.caption}</p>}
          </motion.div>
        )}

        {slide.type==="outro" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{duration:.6}}>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold">{slide.title || "Thank you for watching"}</h2>
            <p className="mt-4 text-lg sm:text-xl md:text-2xl">{slide.subtitle || "Have a wonderful day!"}</p>
          </motion.div>
        )}
      </div>

      {slide.bgImage && (
        <img src={slide.bgImage} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-40"/>
      )}
    </motion.div>
  );
};

/* -------------- Pink player background -------------- */
const PinkSparkles = () => {
  const dots = Array.from({ length: 40 }).map(() => ({
    left: Math.random()*100, top: Math.random()*100,
    size: 2+Math.random()*3, delay: Math.random()*4, dur: 3+Math.random()*3, opacity:.4+Math.random()*.6
  }));
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-fuchsia-600 to-rose-500"/>
      <motion.div className="absolute -top-20 -left-20 w-[55vw] h-[55vw] rounded-full"
        style={{background:"radial-gradient(circle, rgba(255,255,255,.18), transparent 60%)"}}
        animate={{x:[0,30,-20,0], y:[0,-20,10,0], scale:[1,1.06,.98,1]}}
        transition={{duration:16, repeat:Infinity, ease:"easeInOut"}}/>
      <motion.div className="absolute -bottom-24 -right-16 w-[48vw] h-[48vw] rounded-full"
        style={{background:"radial-gradient(circle, rgba(255,255,255,.12), transparent 60%)"}}
        animate={{x:[0,-25,15,0], y:[0,20,-15,0], scale:[1,.95,1.05,1]}}
        transition={{duration:18, repeat:Infinity, ease:"easeInOut"}}/>
      {dots.map((d,i)=>(
        <span key={i} className="absolute rounded-full"
          style={{left:`${d.left}%`,top:`${d.top}%`,width:d.size,height:d.size,background:"white",opacity:d.opacity,boxShadow:"0 0 8px rgba(255,255,255,.8)",animation:`twinkle ${d.dur}s ease-in-out ${d.delay}s infinite`}}/>
      ))}
      <style>{`@keyframes twinkle{0%,100%{transform:scale(.6);opacity:.25}50%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
};

/* -------------- Control panel (Stacked layout) -------------- */
function ControlPanel({ slides, setSlides, celebrant, setCelebrant, theme, setTheme, audio, setAudio }) {
  const field = "w-full px-3 py-2 rounded-lg border outline-none shadow-sm transition bg-white text-neutral-900 placeholder:text-neutral-500 border-neutral-200 focus:ring-2 focus:ring-pink-400/40 focus:border-pink-500";

  const addSlide = (type) => {
    const base = { id: uid(), type, duration: 5, transition: "fade", effect: "none" };
    const presets = {
      title: { title:"Happy Birthday!", subtitle:"Chúc mừng sinh nhật 🎉", bg: theme.background, balloons:true },
      message: { text:"Chúc bạn tuổi mới thật tuyệt!" },
      image: { imageUrl:"", caption:"" },
      video: { videoUrl:"", caption:"" },
      outro: { title:"Have a magical day!", confetti:true },
    };
    setSlides(prev => [...prev, { ...base, ...(presets[type]||{}) }]);
  };
  const move = (id, dir) => {
    setSlides(prev => {
      const i = prev.findIndex(s=>s.id===id);
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = prev.slice();
      const [sp] = copy.splice(i,1);
      copy.splice(j,0,sp);
      return copy;
    });
  };
  const removeSlide = (id) => setSlides(prev => prev.filter(s=>s.id!==id));
  const onImport = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        setCelebrant(data.celebrant || "");
        setTheme(data.theme || theme);
        setSlides(Array.isArray(data.slides)&&data.slides.length ? data.slides : starterSlides);
        setAudio(data.audio || {});
      } catch { alert("Invalid JSON"); }
    };
    r.readAsText(file);
  };
  const onExport = () => download(`birthday-builder-${Date.now()}.json`, JSON.stringify({ celebrant, theme, slides, audio }, null, 2));

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow border border-neutral-200">
        <h3 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2 text-pink-600"><Sparkles size={18}/>Một số thông tin cần thiết</h3>

        <label className="block text-sm font-medium mb-1">Không được bỏ trống</label>
        <input className={field} placeholder="VD: Thiên Anh" value={celebrant} onChange={e=>setCelebrant(e.target.value)}/>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm font-medium mb-1">Chủ đề</label>
            <select className={field} value={theme.background} onChange={e=>setTheme({...theme,background:e.target.value})}>
              <option value="gradient-candy">Gradient Candy (Hồng)</option>
              <option value="gradient-ocean">Gradient Ocean</option>
              <option value="gradient-sunset">Gradient Sunset</option>
              <option value="solid-dark">Solid Dark</option>
              <option value="solid-light">Solid Light</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Font size</label>
            <select className={field} value={theme.fontSize} onChange={e=>setTheme({...theme,fontSize:e.target.value})}>
              <option value="base">Base</option><option value="lg">Large</option><option value="xl">XL</option><option value="2xl">2XL</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2 text-pink-600"><Music2 size={16}/> Nhạc nền (tùy chọn)</div>
          <input className={field} placeholder="Dán URL .mp3 / .m4a / .ogg" value={audio.url||""} onChange={e=>setAudio({...audio,url:e.target.value})}/>
          <label className="flex items-center gap-2 mt-2 text-sm select-none">
            <input type="checkbox" checked={audio.autoplay ?? true} onChange={e=>setAudio({...audio,autoplay:e.target.checked})}/> Tự động phát
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow border border-neutral-200">
        <h3 className="font-semibold text-base sm:text-lg mb-2">Danh sách slide</h3>

        <div className="space-y-2">
          {slides.map((s,i)=>(
            <div key={s.id} className="w-full px-3 py-2 rounded-xl border bg-white border-neutral-200 flex items-center justify-between">
              <span className="truncate"><b className="mr-2">{i+1}.</b>{s.type} {s.title?`— ${s.title}`:s.caption?`— ${s.caption}`:s.text?`— ${s.text.slice(0,20)}…`:s.imageUrl?"— image":""}</span>
              <span className="flex items-center gap-1">
                <button onClick={()=>move(s.id,-1)} className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200">↑</button>
                <button onClick={()=>move(s.id,1)}  className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200">↓</button>
                <button onClick={()=>removeSlide(s.id)} className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"><Trash2 size={14}/></button>
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 mt-3">
          <button onClick={()=>addSlide("title")}   className="px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1"><Type size={16}/>Title</button>
          <button onClick={()=>addSlide("message")} className="px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">Msg</button>
          <button onClick={()=>addSlide("image")}   className="px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1"><ImgIcon size={16}/>Img</button>
          <button onClick={()=>addSlide("video")}   className="px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1"><VideoIcon size={16}/>Vid</button>
          <button onClick={()=>addSlide("outro")}   className="px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">Outro</button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 cursor-pointer select-none">
            <Upload size={16}/> <span>Import JSON</span>
            <input type="file" accept="application/json" className="hidden" onChange={e=>e.target.files?.[0] && onImport(e.target.files[0])}/>
          </label>
          <button onClick={onExport} className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white flex items-center justify-center gap-2">
            <Download size={16}/> Export
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------- Player (full viewport) -------------- */
function Player({ slides, celebrant, theme, audio, onExit }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{ ref.current?.requestFullscreen?.().catch(()=>{}); },[]);
  useEffect(()=>{
    const key = (e)=>{ if(e.key===" "||e.key==="ArrowRight") next(); if(e.key==="ArrowLeft") prev(); if(e.key==="Escape") onExit(); if(e.key.toLowerCase()==="p") setPaused(p=>!p); };
    window.addEventListener("keydown",key); return ()=>window.removeEventListener("keydown",key);
  },[onExit]);
  useEffect(()=>{ if(paused) return; const t=setTimeout(()=>next(), (slides[index]?.duration||5)*1000); return ()=>clearTimeout(t); },[index,paused,slides]);

  const next=()=>setIndex(i=> (i+1<slides.length ? i+1 : (onExit(), i)));
  const prev=()=>setIndex(i=> Math.max(0, i-1));

  return (
    <div ref={ref} className="fixed inset-0">
      <PinkSparkles/>
        <audio 
        src="/tamtrilangthang.mp3" 
        autoPlay 
        loop 
        className="hidden" 
        />
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <Slide key={slides[index]?.id} slide={slides[index]} celebrant={celebrant} theme={theme}/>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/15 backdrop-blur rounded-2xl px-3 py-2 text-white">
        <button onClick={prev} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><ArrowLeft/></button>
        <button onClick={()=>setPaused(p=>!p)} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">{paused ? <Play/> : <Pause/>}</button>
        <button onClick={next} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><ArrowRight/></button>
      </div>
      <button onClick={onExit} className="absolute top-4 right-4 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white">Thoát</button>
    </div>
  );
}

/* -------------- Root (FULL-WIDTH, stacked) -------------- */
export default function BirthdayBuilderApp() {
  const [slides, setSlides] = useState(starterSlides);
  const [celebrant, setCelebrant] = useState("");
  const [theme, setTheme] = useState({ background: "gradient-candy", fontSize: "xl" });
  const [audio, setAudio] = useState({ url: "", autoplay: true });
  const [present, setPresent] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-neutral-100 text-neutral-900 overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">🎂Happy Birthday</h1>
              <p className="text-neutral-600">Được tạo ra dành riêng cho em.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPresent(true)} className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow"><Play size={18}/> Trình chiếu</button>
              <a href="https://fonts.google.com/specimen/Poppins" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-2xl bg-white text-neutral-800 shadow border border-neutral-200">Font gợi ý</a>
            </div>
          </div>
        </div>
      </header>

      {/* Preview (full-width block) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 shadow relative bg-neutral-900">
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <Slide key={slides[0]?.id + "-preview"} slide={slides[0]} celebrant={celebrant} theme={theme}/>
            </AnimatePresence>
          </div>
          <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-lg bg-black/40 text-white">Xem nhanh slide #1</div>
        </div>
      </section>

      {/* Form (full-width block dưới) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-10">
        <ControlPanel slides={slides} setSlides={setSlides} celebrant={celebrant} setCelebrant={setCelebrant} theme={theme} setTheme={setTheme} audio={audio} setAudio={setAudio}/>
        <p className="mt-6 text-sm text-neutral-500">Gợi ý: thêm slide “Outro” và bật Confetti để có hiệu ứng pháo giấy khi kết thúc.</p>
      </section>

      {present && <Player slides={slides} celebrant={celebrant} theme={theme} audio={audio} onExit={()=>setPresent(false)}/>}
    </div>
  );
}