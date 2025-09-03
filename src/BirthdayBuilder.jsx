import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Plus, Trash2, Upload, Download,
  ArrowLeft, ArrowRight, Sparkles, PartyPopper,
  Image as ImgIcon, Video as VideoIcon, Music2, Type, TimerReset
} from "lucide-react";

/* =============================
   Helpers
============================= */
const uid = () => Math.random().toString(36).slice(2, 9);
const download = (filename, text) => {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a);
  a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
};

/* =============================
   Simple background balloons
============================= */
const Balloons = ({ count = 10 }) => {
  const items = useMemo(
    () => Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      size: 24 + Math.random() * 36,
      delay: Math.random() * 5,
      duration: 12 + Math.random() * 10,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-[-80px]"
          style={{ left: `${b.left}%`, animation: `floatY ${b.duration}s linear ${b.delay}s infinite` }}
        >
          <div
            className="rounded-full opacity-80"
            style={{
              width: b.size, height: b.size,
              background: `hsl(${(i * 47) % 360} 90% 65%)`,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes floatY { from { transform: translateY(0); } to { transform: translateY(-120vh); } }
      `}</style>
    </div>
  );
};

/* =============================
   Confetti (lazy import)
============================= */
const Confetti = ({ fire }) => {
  const firedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (fire && !firedRef.current) {
        firedRef.current = true;
        try {
          const mod = await import("canvas-confetti");
          if (cancelled) return;
          const confetti = mod.default;
          const burst = (x) => confetti({ particleCount: 90, spread: 70, origin: { x, y: 0.8 } });
          burst(0.2); burst(0.5); burst(0.8);
          setTimeout(() => burst(0.35), 350);
          setTimeout(() => burst(0.65), 550);
        } catch { /* ignore */ }
      }
    })();
    return () => { cancelled = true; };
  }, [fire]);
  return null;
};

/* =============================
   Transitions & Effects
============================= */
const transitions = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  "slide-left": { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } },
  "slide-right": { initial: { x: -80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 80, opacity: 0 } },
  zoom: { initial: { scale: 0.92, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.92, opacity: 0 } },
  flip: { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: -90, opacity: 0 }, style: { transformStyle: "preserve-3d" } },
};
const effects = {
  none: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
  bounce: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.45 } } },
  "fade-up": { initial: { y: 24, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  "rotate-in": { initial: { rotate: -8, opacity: 0 }, animate: { rotate: 0, opacity: 1 } },
};

/* =============================
   Starter slides
============================= */
const starterSlides = [
  { id: uid(), type: "title", title: "Happy Birthday!", subtitle: "🎉 chú ý âm lượng 🎉", bg: "gradient-candy", duration: 7, transition: "fade", effect: "bounce", balloons: true },
    {
    id: uid(),
    type: "message",
    text: "Chúc mừng sinh nhật🎉.\nChúc em một tuổi mới dồi dào sức khỏe để học tập và theo đuổi những điều mình yêu thích.\nMong em sẽ luôn giữ được sự sáng suốt và nhiệt huyết trên con đường mình đã chọn, để mọi nỗ lực đều mang lại kết quả ngọt ngào.\nSinh nhật vui vẻ nhé và hẹn gặp lại.",
    duration: 15,
    transition: "slide-left",
    effect: "fade-up"
    },  
  { id: uid(), type: "image", imageUrl: "/Anhduynhat.jpeg", caption: "Ảnh duy nhất có trong máy ✨", duration: 7, transition: "zoom", effect: "none" },
  { id: uid(), type: "image", imageUrl: "/thienanh.png", caption: "xin lỗi vì lấy chưa xin ✨", duration: 7, transition: "zoom", effect: "none" },
  { id: uid(), type: "image", imageUrl: "/IMG_7920.png", caption: "không biết từ đâu ra ✨", duration: 7, transition: "zoom", effect: "none" },
  { id: uid(), type: "outro", title: "Have a nice day bro!", subtitle: "Hẹn gặp lại 💖", duration: 7, transition: "flip", effect: "rotate-in", confetti: true },
];

/* =============================
   Slide renderer
============================= */
const Slide = ({ slide, celebrant, theme }) => {
  const t = transitions[slide.transition] || transitions.fade;
  const e = effects[slide.effect] || effects.none;

  const bgClass = useMemo(() => {
    switch (slide.bg || theme.background) {
      case "gradient-candy":
        return "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500";
      case "gradient-ocean":
        return "bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800";
      case "gradient-sunset":
        return "bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-600";
      case "solid-dark":
        return "bg-neutral-900";
      case "solid-light":
        return "bg-neutral-100";
      default:
        return "bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500";
    }
  }, [slide.bg, theme.background]);

  return (
    <motion.div
      key={slide.id}
      className={`relative w-full h-full ${bgClass} text-white flex items-center justify-center p-6`}
      initial={t.initial}
      animate={t.animate}
      exit={t.exit}
      transition={{ duration: 0.6 }}
      style={t.style}
    >
      {slide.balloons && <Balloons count={14} />}
      {slide.confetti && <Confetti fire />}
      <div className="relative z-10 max-w-4xl text-center drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
        {slide.type === "title" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none">
              {slide.title || `Happy Birthday ${celebrant || "🎂"}!`}
            </h1>
            <p className="mt-4 text-xl md:text-2xl opacity-95">{slide.subtitle || "Wishing you all the best"}</p>
          </motion.div>
        )}
        {slide.type === "message" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{celebrant ? `Dear ${celebrant},` : " "}</h2>
            <p className="whitespace-pre-line text-xl md:text-2xl leading-relaxed">{slide.text}</p>
          </motion.div>
        )}
        {slide.type === "image" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{ duration: 0.6 }}>
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt="slide" className="mx-auto max-h-[60vh] w-auto rounded-2xl shadow-2xl" />
            ) : (
              <div className="p-12 rounded-2xl bg-white/15">(Add an image URL)</div>
            )}
            {slide.caption && <p className="mt-4 text-xl md:text-2xl">{slide.caption}</p>}
          </motion.div>
        )}
        {slide.type === "video" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{ duration: 0.6 }}>
            {slide.videoUrl ? (
              <video src={slide.videoUrl} className="mx-auto max-h-[60vh] w-auto rounded-2xl shadow-2xl" controls />
            ) : (
              <div className="p-12 rounded-2xl bg-white/15">(Add a video URL)</div>
            )}
            {slide.caption && <p className="mt-4 text-xl md:text-2xl">{slide.caption}</p>}
          </motion.div>
        )}
        {slide.type === "outro" && (
          <motion.div initial={e.initial} animate={e.animate} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-6xl font-extrabold">{slide.title || "Thank you for watching"}</h2>
            <p className="mt-4 text-xl md:text-2xl">{slide.subtitle || "Have a wonderful day!"}</p>
          </motion.div>
        )}
      </div>

      {slide.bgImage && (
        <img src={slide.bgImage} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
    </motion.div>
  );
};

/* =============================
   Control Panel
============================= */
function ControlPanel({ slides, setSlides, celebrant, setCelebrant, theme, setTheme, audio, setAudio }) {
  const [selectedId, setSelectedId] = useState(slides[0]?.id);
  const selected = slides.find((s) => s.id === selectedId) || slides[0];

  useEffect(() => {
    if (!slides.some((s) => s.id === selectedId) && slides[0]) setSelectedId(slides[0].id);
  }, [slides, selectedId]);

  const addSlide = (type) => {
    const base = { id: uid(), type, duration: 6, transition: "fade", effect: "none" };
    const presets = {
      title: { title: "Happy Birthday!", subtitle: "🎉 🎉 🎉 🎉 🎉 🎉 🎉", bg: theme.background, balloons: true },
      message: { text: "Chúc bạn tuổi mới thật tuyệt!" },
      image: { imageUrl: "", caption: "" },
      video: { videoUrl: "", caption: "" },
      outro: { title: "Have a magical day!", subtitle: "Cảm ơn đã xem 💖", balloons: true, confetti: true },
    };
    setSlides([...slides, { ...base, ...(presets[type] || {}) }]);
    setSelectedId(base.id);
  };

  const updateSelected = (patch) => {
    setSlides(slides.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
  };

  const removeSlide = (id) => {
    const idx = slides.findIndex((s) => s.id === id);
    const next = slides.filter((s) => s.id !== id);
    setSlides(next);
    if (next.length) setSelectedId(next[Math.max(0, idx - 1)].id);
  };

  const move = (id, dir) => {
    const i = slides.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const copy = slides.slice();
    const [spliced] = copy.splice(i, 1);
    copy.splice(j, 0, spliced);
    setSlides(copy);
  };

  const onImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        setCelebrant(data.celebrant || "");
        setTheme(data.theme || theme);
        setSlides(Array.isArray(data.slides) && data.slides.length ? data.slides : starterSlides);
        setAudio(data.audio || {});
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const onExport = () => {
    const payload = JSON.stringify({ celebrant, theme, slides, audio }, null, 2);
    download(`birthday-builder-${Date.now()}.json`, payload);
  };

  return (
    <div className="w-full grid grid-cols-1 gap-4">
      {/* Chung */}
      <div className="bg-white rounded-2xl p-4 shadow border border-neutral-200 text-black">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-pink-600">
          <Sparkles size={18} /> Form thông tin này chỉ cần điền tên thoii
        </h3>

        <label className="block text-sm font-medium mb-1">Nhớ điền Tên nhé</label>
        <input
          value={celebrant}
          onChange={(e) => setCelebrant(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white border text-black placeholder:text-gray-500 focus:ring-2 focus:ring-pink-400"
          placeholder="VD: Thiên Anh, Su, ...."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm font-medium mb-1">Chủ đề</label>
            <select
              value={theme.background}
              onChange={(e) => setTheme({ ...theme, background: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border text-black focus:ring-2 focus:ring-pink-400"
            >
              <option value="gradient-candy">Gradient Candy (Hồng)</option>
              <option value="gradient-ocean">Gradient Ocean</option>
              <option value="gradient-sunset">Gradient Sunset</option>
              <option value="solid-dark">Solid Dark</option>
              <option value="solid-light">Solid Light</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Font size</label>
            <select
              value={theme.fontSize}
              onChange={(e) => setTheme({ ...theme, fontSize: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border text-black focus:ring-2 focus:ring-pink-400"
            >
              <option value="base">Base</option>
              <option value="lg">Large</option>
              <option value="xl">XL</option>
              <option value="2xl">2XL</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2 text-pink-600">
            <Music2 size={16} /> Nhạc nền (tùy chọn)
          </div>
          <input
            value={audio.url || ""}
            onChange={(e) => setAudio({ ...audio, url: e.target.value })}
            placeholder="Dán URL .mp3 / .m4a / .ogg — để trống sẽ dùng /tamtrilangthang.mp3"
            className="w-full px-3 py-2 rounded-lg bg-white border text-black placeholder:text-gray-500 focus:ring-2 focus:ring-pink-400"
          />
          <div className="flex items-center gap-2 mt-2">
            <label className="text-sm">Tự động phát</label>
            <input
              type="checkbox"
              checked={audio.autoplay ?? true}
              onChange={(e) => setAudio({ ...audio, autoplay: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* Danh sách slide */}
      <div className="bg-white rounded-2xl p-4 shadow border border-neutral-200 text-black">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <TimerReset size={18} /> Danh sách slide
        </h3>

        <div className="space-y-2 max-h-[38vh] overflow-auto pr-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between ${
                selectedId === s.id ? "bg-indigo-50 border-indigo-300" : "bg-white border-neutral-200"
              }`}
            >
              <span className="truncate">
                <b className="mr-2">{i + 1}.</b>
                {s.type}{" "}
                {s.title
                  ? `— ${s.title}`
                  : s.caption
                  ? `— ${s.caption}`
                  : s.text
                  ? `— ${s.text.slice(0, 20)}…`
                  : s.imageUrl
                  ? "— image"
                  : ""}
              </span>
              <span className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); move(s.id, -1); }} className="px-2 py-1 rounded-lg bg-neutral-100">↑</button>
                <button onClick={(e) => { e.stopPropagation(); move(s.id, 1); }} className="px-2 py-1 rounded-lg bg-neutral-100">↓</button>
                <button onClick={(e) => { e.stopPropagation(); removeSlide(s.id); }} className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700">
                  <Trash2 size={14} />
                </button>
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 mt-3">
          <button onClick={() => addSlide("title")} className="px-2 py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-1"><Type size={16}/>Title</button>
          <button onClick={() => addSlide("message")} className="px-2 py-2 rounded-xl bg-indigo-600 text-white">Msg</button>
          <button onClick={() => addSlide("image")} className="px-2 py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-1"><ImgIcon size={16}/>Img</button>
          <button onClick={() => addSlide("video")} className="px-2 py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-1"><VideoIcon size={16}/>Vid</button>
          <button onClick={() => addSlide("outro")} className="px-2 py-2 rounded-xl bg-indigo-600 text-white">Outro</button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 cursor-pointer">
            <Upload size={16} />
            <span>Import JSON</span>
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </label>
          <button onClick={onExport} className="px-3 py-2 rounded-xl bg-neutral-900 text-white flex items-center justify-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Editor của slide đang chọn */}
      {selected && (
        <div className="bg-white rounded-2xl p-4 shadow border border-neutral-200 text-black">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <PartyPopper size={18} /> Chỉnh slide: <span className="px-2 py-1 rounded-lg bg-neutral-100 ml-2 text-sm">{selected.type}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Chuyển cảnh</label>
              <select
                value={selected.transition}
                onChange={(e) => updateSelected({ transition: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border text-black"
              >
                <option value="fade">Fade</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
                <option value="zoom">Zoom</option>
                <option value="flip">Flip</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hiệu ứng nội dung</label>
              <select
                value={selected.effect}
                onChange={(e) => updateSelected({ effect: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border text-black"
              >
                <option value="none">None</option>
                <option value="bounce">Bounce</option>
                <option value="fade-up">Fade Up</option>
                <option value="rotate-in">Rotate In</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời lượng (giây)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={selected.duration || 6}
                onChange={(e) => updateSelected({ duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-white border text-black"
              />
            </div>
          </div>

          {selected.type === "title" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input value={selected.title || ""} onChange={(e) => updateSelected({ title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phụ đề</label>
                <input value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kiểu nền</label>
                <select
                  value={selected.bg || theme.background}
                  onChange={(e) => updateSelected({ bg: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border text-black"
                >
                  <option value="gradient-candy">Gradient Candy</option>
                  <option value="gradient-ocean">Gradient Ocean</option>
                  <option value="gradient-sunset">Gradient Sunset</option>
                  <option value="solid-dark">Solid Dark</option>
                  <option value="solid-light">Solid Light</option>
                </select>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.balloons} onChange={(e) => updateSelected({ balloons: e.target.checked })} />
                  <span>Bóng bay nền</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.confetti} onChange={(e) => updateSelected({ confetti: e.target.checked })} />
                  <span>Confetti</span>
                </label>
              </div>
            </div>
          )}

          {selected.type === "message" && (
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea rows={4} value={selected.text || ""} onChange={(e) => updateSelected({ text: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.balloons} onChange={(e) => updateSelected({ balloons: e.target.checked })} />
                  <span>Bóng bay nền</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.confetti} onChange={(e) => updateSelected({ confetti: e.target.checked })} />
                  <span>Confetti</span>
                </label>
              </div>
            </div>
          )}

          {selected.type === "image" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input value={selected.imageUrl || ""} onChange={(e) => updateSelected({ imageUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <input value={selected.caption || ""} onChange={(e) => updateSelected({ caption: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Ảnh nền (tùy chọn)</label>
                <input value={selected.bgImage || ""} onChange={(e) => updateSelected({ bgImage: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" placeholder="Background image URL" />
              </div>
            </div>
          )}

          {selected.type === "video" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input value={selected.videoUrl || ""} onChange={(e) => updateSelected({ videoUrl: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <input value={selected.caption || ""} onChange={(e) => updateSelected({ caption: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
            </div>
          )}

          {selected.type === "outro" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input value={selected.title || ""} onChange={(e) => updateSelected({ title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phụ đề</label>
                <input value={selected.subtitle || ""} onChange={(e) => updateSelected({ subtitle: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border text-black" />
              </div>
              <div className="flex items-center gap-4 mt-2 md:col-span-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.confetti} onChange={(e) => updateSelected({ confetti: e.target.checked })} />
                  <span>Confetti</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected.balloons} onChange={(e) => updateSelected({ balloons: e.target.checked })} />
                  <span>Bóng bay nền</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =============================
   Player (đã vá: timer safe, không auto-exit, fallback)
============================= */
function Player({ slides, celebrant, theme, audio, onExit }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const key = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === "p") setPaused((p) => !p);
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onExit]);

  useEffect(() => {
    if (paused) return;
    const cur = slides?.[index];
    if (!cur) return;
    const base = cur.duration ?? 6;
    const dur = (base + 5) * 1000; // thêm 2s “nghỉ” giữa slide
    const id = setTimeout(() => next(), dur);
    return () => clearTimeout(id);
  }, [index, paused, slides]);

  const next = () => {
    setIndex((i) => {
      if (!slides || slides.length === 0) return 0;
      if (i + 1 < slides.length) return i + 1;
      setPaused(true); // dừng ở slide cuối, KHÔNG tự thoát
      return i;
    });
  };
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  const curSlide = slides?.[index];

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black">
      {/* audio fallback: nếu không nhập url sẽ dùng file trong /public */}
      <audio
        src={audio?.url && audio.url.trim() ? audio.url : "/tamtrilangthang.mp3"}
        autoPlay={audio?.autoplay ?? true}
        loop
        className="hidden"
      />

      <div className="absolute inset-0">
        {curSlide ? (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
            key={`${slides[index]?.id}-${index}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            >
            <Slide slide={slides[index]} celebrant={celebrant} theme={theme} />
            </motion.div>
        </AnimatePresence>

        ) : (
          (() => {
            setTimeout(onExit, 0);
            return (
              <div className="w-full h-full flex items-center justify-center text-white">
                Không có slide để hiển thị — đang thoát trình chiếu…
              </div>
            );
          })()
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl px-3 py-2 text-white">
        <button onClick={prev} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><ArrowLeft /></button>
        <button onClick={() => setPaused((p) => !p)} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">
          {paused ? <Play /> : <Pause />}
        </button>
        <button onClick={next} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><ArrowRight /></button>
      </div>
      <button onClick={onExit} className="absolute top-4 right-4 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white">Thoát</button>
    </div>
  );
}

/* =============================
   Root App
============================= */
export default function BirthdayBuilderApp() {
  const [slides, setSlides] = useState(starterSlides);
  const [celebrant, setCelebrant] = useState("");
  const [theme, setTheme] = useState({ background: "gradient-candy", fontSize: "xl" });
  const [audio, setAudio] = useState({ url: "", autoplay: true });
  const [present, setPresent] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-100 to-neutral-200">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Preview */}
        <header className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 text-pink-600">
              🎂 Happy Birthday
            </h1>
            <p className="text-neutral-600">Được tạo ra dành riêng cho 1 người</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPresent(true)} className="px-4 py-2 rounded-2xl bg-indigo-600 text-white flex items-center gap-2 shadow">
              <Play size={18} /> Điền tên rùi thì nhấn vô đây 
            </button>
            <a href="https://fonts.google.com/specimen/Poppins" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-2xl bg-white text-neutral-800 shadow">
              Font gợi ý
            </a>
          </div>
        </header>

        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-neutral-200 shadow relative bg-neutral-900">
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <Slide key={slides[0]?.id || "preview"} slide={slides[0] || starterSlides[0]} celebrant={celebrant} theme={theme} />
            </AnimatePresence>
          </div>
          <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-lg bg-black/40 text-white">Xem nhanh slide #1</div>
        </div>

        {/* Form dưới một cột (full-width, responsive) */}
        <div className="mt-6 space-y-6">
          <ControlPanel
            slides={slides}
            setSlides={setSlides}
            celebrant={celebrant}
            setCelebrant={setCelebrant}
            theme={theme}
            setTheme={setTheme}
            audio={audio}
            setAudio={setAudio}
          />
        </div>

        <footer className="mt-6 text-sm text-neutral-500">
          Lưu ý: chỉ cần điền tên và bấm trình chiếu là được. Các thiết lập khác có thể bỏ trống và để mặc định. <br />
                                                             Sinh nhật vui vẻ nhen, hẹn gặp lại.
        </footer>
      </div>

      {present && (
        <Player
          slides={slides}
          celebrant={celebrant}
          theme={theme}
          audio={audio}
          onExit={() => setPresent(false)}
        />
      )}
    </div>
  );
}