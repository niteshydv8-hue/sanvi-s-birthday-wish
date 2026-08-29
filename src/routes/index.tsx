import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import memory1 from "@/assets/memory-1.jpg";
import memory2 from "@/assets/memory-2.jpg";
import memory3 from "@/assets/memory-3.jpg";
import memory4 from "@/assets/memory-4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Sanvi! 🎂❤️" },
      {
        name: "description",
        content:
          "A cute little birthday surprise for Sanvi — wishes, memories, sparkles and one last surprise. ✨",
      },
      { property: "og:title", content: "Happy Birthday, Sanvi! 🎂❤️" },
      {
        property: "og:description",
        content: "Today is special because someone very special was born today. ✨",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BirthdayPage,
});

const MEMORIES = [
  { src: memory1, caption: "Balloons, flowers & your favourite kind of chaos 🎈" },
  { src: memory2, caption: "A sky full of hearts, just like your heart 💗" },
  { src: memory3, caption: "Little moments we'll always keep in polaroids 📸" },
  { src: memory4, caption: "Sunsets are pretty, but your smile wins ✨" },
];

type Floater = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  glyph: string;
  opacity: number;
};

function useFloaters(count: number) {
  return useMemo<Floater[]>(() => {
    const glyphs = ["❤️", "💖", "✨", "⭐", "🌸", "💫"];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 22,
      duration: 12 + Math.random() * 14,
      delay: Math.random() * 16,
      glyph: glyphs[i % glyphs.length],
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, [count]);
}

type Piece = {
  id: number;
  left: number;
  drift: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  radius: string;
};

function Confetti({ burst }: { burst: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (burst === 0) return;
    const colors = [
      "oklch(0.72 0.19 350)",
      "oklch(0.78 0.15 305)",
      "oklch(0.88 0.13 90)",
      "oklch(0.8 0.14 200)",
      "oklch(0.95 0.05 340)",
    ];
    const next: Piece[] = Array.from({ length: 90 }, (_, i) => ({
      id: burst * 1000 + i,
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 260,
      size: 6 + Math.random() * 9,
      duration: 2.6 + Math.random() * 2.4,
      delay: Math.random() * 0.6,
      color: colors[i % colors.length],
      radius: Math.random() > 0.5 ? "9999px" : "2px",
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 6000);
    return () => clearTimeout(t);
  }, [burst]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            borderRadius: p.radius,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

function Cake({ lit }: { lit: boolean }) {
  return (
    <div className="relative mx-auto flex w-56 flex-col items-center animate-sway sm:w-64">
      <div className="relative flex flex-col items-center">
        <div
          className={`h-6 w-3 origin-bottom rounded-full transition-opacity duration-500 ${
            lit ? "animate-flicker opacity-100" : "opacity-0"
          }`}
          style={{
            background: "linear-gradient(180deg, oklch(0.97 0.12 95), oklch(0.75 0.2 45))",
            boxShadow: "0 0 26px oklch(0.9 0.15 80 / 80%)",
          }}
        />
        <div className="h-7 w-1.5 rounded-full bg-secondary-foreground/70" />
      </div>
      <div className="glass h-8 w-40 rounded-t-2xl rounded-b-md" />
      <div
        className="h-14 w-48 rounded-xl"
        style={{ background: "var(--gradient-candy)", boxShadow: "var(--shadow-soft)" }}
      />
      <div className="glass h-16 w-56 rounded-xl" />
      <div className="mt-2 h-3 w-60 rounded-full bg-foreground/10 blur-sm" />
    </div>
  );
}

function useSoftMusic() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const toggle = useCallback(() => {
    if (on) {
      stopRef.current?.();
      stopRef.current = null;
      setOn(false);
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = ctxRef.current ?? new Ctor();
    ctxRef.current = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 1.5);

    const notes = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33];
    let i = 0;
    const play = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i % notes.length];
      i += 1;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.4);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.7);
      osc.connect(gain).connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    };
    play();
    const interval = window.setInterval(play, 1400);

    stopRef.current = () => {
      window.clearInterval(interval);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => master.disconnect(), 900);
    };
    setOn(true);
  }, [on]);

  useEffect(() => () => stopRef.current?.(), []);

  return { on, toggle };
}

function BirthdayPage() {
  const floaters = useFloaters(26);
  const stars = useFloaters(18);
  const [burst, setBurst] = useState(0);
  const [wished, setWished] = useState(false);
  const [surprise, setSurprise] = useState(false);
  const music = useSoftMusic();

  const makeWish = () => {
    setWished(true);
    setBurst((b) => b + 1);
  };

  const openSurprise = () => {
    setSurprise(true);
    setBurst((b) => b + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-6">
      {/* ambient sparkles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {stars.map((s) => (
          <span
            key={`s-${s.id}`}
            className="absolute animate-twinkle text-primary-foreground"
            style={{
              left: `${s.left}%`,
              top: `${(s.id * 37) % 100}%`,
              fontSize: s.size * 0.7,
              animationDelay: `${s.delay}s`,
            }}
          >
            ✦
          </span>
        ))}
        {floaters.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-0 animate-float-up select-none"
            style={{
              left: `${f.left}%`,
              fontSize: f.size,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.glyph}
          </span>
        ))}
      </div>

      <Confetti burst={burst} />

      <div className="mx-auto flex max-w-3xl justify-end">
        <button
          onClick={music.toggle}
          aria-pressed={music.on}
          className="glass rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-transform duration-200 hover:scale-105"
        >
          {music.on ? "🔊 Music ON" : "🔇 Music OFF"}
        </button>
      </div>

      {/* Hero */}
      <section className="mx-auto mt-8 max-w-3xl text-center">
        <p className="animate-pop-in text-sm font-semibold uppercase tracking-[0.35em] text-foreground/50">
          29 · A very special day
        </p>
        <h1
          className="animate-pop-in mt-4 animate-glow text-4xl leading-tight font-bold text-gradient sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Happy Birthday, Sanvi! 🎂❤️
        </h1>
        <p className="animate-pop-in mx-auto mt-5 max-w-xl text-base text-foreground/70 sm:text-lg">
          Today is special because someone very special was born today. ✨
        </p>

        <div className="glass mx-auto mt-10 rounded-4xl p-8">
          <Cake lit={!wished} />
          <button
            onClick={makeWish}
            className="mt-8 rounded-full px-8 py-4 text-lg font-bold text-primary-foreground transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{ background: "var(--gradient-candy)", boxShadow: "var(--shadow-glow)" }}
          >
            Make a Wish 🎂
          </button>
          {wished && (
            <p
              className="animate-pop-in mt-6 text-xl font-semibold text-gradient"
              style={{ fontFamily: "var(--font-display)" }}
            >
              May all your wishes come true, Sanvi! ✨
            </p>
          )}
        </div>
      </section>

      {/* Message */}
      <section className="mx-auto mt-16 max-w-2xl">
        <div className="glass rounded-4xl p-7 sm:p-10">
          <h2
            className="text-2xl text-gradient sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A little note for you 💌
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground/75 sm:text-lg">
            Dear Sanvi, you may call me an idiot 😂, but today I just want to remind you how
            special you are. I hope this new year brings you endless happiness, beautiful
            memories, success and countless reasons to smile. Keep being your crazy, cute and
            amazing self. ❤️
          </p>
        </div>
      </section>

      {/* Memories */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2
          className="text-center text-2xl text-gradient sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Memories 📸
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {MEMORIES.map((m, i) => (
            <figure
              key={m.caption}
              className="glass group rounded-3xl p-3 transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg]"
              style={{ animation: `pop-in 0.6s ease-out ${i * 0.08}s both` }}
            >
              <img
                src={m.src}
                alt={m.caption}
                width={800}
                height={800}
                loading="lazy"
                className="h-56 w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <figcaption className="px-2 py-3 text-center text-sm font-semibold text-foreground/70">
                {m.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Surprise */}
      <section className="mx-auto mt-16 max-w-2xl text-center">
        {!surprise ? (
          <button
            onClick={openSurprise}
            className="glass animate-sway rounded-4xl px-10 py-8 text-2xl font-bold text-gradient transition-transform duration-200 hover:scale-105"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One Last Surprise 💝
          </button>
        ) : (
          <div className="glass animate-pop-in rounded-4xl p-8 sm:p-10">
            <p
              className="text-2xl leading-relaxed text-gradient sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Happy Birthday, Sanvi! ❤️
            </p>
            <p className="mt-4 text-base text-foreground/75 sm:text-lg">
              You deserve all the happiness in the world. Keep smiling and keep shining! ✨🎂
            </p>
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-sm text-foreground/50">
        Made with ❤️ just for Sanvi
      </footer>
    </main>
  );
}
