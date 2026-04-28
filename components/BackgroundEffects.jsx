"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const words = [
  "SEARCH",
  "DISCOVER",
  "EXPLORE",
  "NAVIGATE",
  "FIND",
  "BROWSE",
  "SURF",
  "QUERY",
  "CODE",
  "INDEX",
  "ARCHIVE",
  "PORTAL",
  "LAUNCH",
  "SIGNAL",
  "VECTOR",
  "ORBIT",
  "SYNC",
  "LINK",
  "NODE",
  "STACK",
  "FOCUS",
  "FLOW",
  "TRACE",
  "ROUTE",
  "ATLAS",
  "NEXUS",
  "PULSE",
  "MATRIX",
  "VAULT",
  "BOOKMARK",
  "TERMINAL",
  "COMMAND",
  "PROMPT",
  "ENGINE",
  "WINDOW",
  "HORIZON",
];
const wordColors = [
  "rgba(255, 56, 92, 0.12)",
  "rgba(101, 84, 192, 0.12)",
  "rgba(0, 184, 217, 0.12)",
  "rgba(255, 171, 0, 0.12)",
  "rgba(54, 179, 126, 0.12)",
  "rgba(87, 96, 106, 0.12)",
];

export default function BackgroundEffects({ effect, showGrid }) {
  return (
    <div className="background-root" aria-hidden="true">
      {showGrid && <GridLayer />}
      {effect !== "none" && <EffectLayer key={effect} effect={effect} />}
      <BackgroundWords />
    </div>
  );
}

function GridLayer() {
  return (
    <div className="grid-layer">
      <div className="grid-lines" />
      <div className="grid-accent-block" />
    </div>
  );
}

function EffectLayer({ effect }) {
  switch (effect) {
    case "wave":
      return <WaveEffect />;
    case "blob-scatter":
      return <BlobScatterEffect />;
    case "layered-peaks":
      return <LayeredPeaksEffect />;
    case "layered-steps":
      return <LayeredStepsEffect />;
    case "world-map":
      return <WorldMapEffect />;
    case "blob":
    default:
      return <BlobEffect />;
  }
}

function BlobEffect() {
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(topRef.current, { y: -405 }, { y: 0, duration: 1, ease: "power2.out", delay: 0.2 });
      gsap.fromTo(bottomRef.current, { y: 910 }, { y: 540, duration: 1, ease: "power2.out", delay: 0.4 });
    }, rootRef);
    return () => context.revert();
  }, []);
  return (
    <div ref={rootRef} className="effect-shell">
      <svg viewBox="0 0 960 540" className="effect-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g ref={topRef} className="blob-corner-top" transform="translate(960, 0)">
          <path d="M0 405C-33.6 366.4 -67.1 327.8 -100.7 310C-134.4 292.3 -168.1 295.3 -210.4 289.6C-252.8 283.9 -303.8 269.4 -327.7 238.1C-351.5 206.7 -348.3 158.4 -356.6 115.9C-365 73.4 -385 36.7 -405 0L0 0Z" style={{ fill: "var(--color-accent-light)" }} />
          <path d="M0 202.5C-16.8 183.2 -33.6 163.9 -50.4 155C-67.2 146.1 -84 147.7 -105.2 144.8C-126.4 142 -151.9 134.7 -163.8 119C-175.8 103.3 -174.1 79.2 -178.3 57.9C-182.5 36.7 -192.5 18.3 -202.5 0L0 0Z" style={{ fill: "var(--color-accent)" }} />
        </g>
        <g ref={bottomRef} className="blob-corner-bottom" transform="translate(0, 540)">
          <path d="M0 -405C29.3 -359.4 58.6 -313.8 97.3 -299.6C136 -285.4 184.1 -302.7 208.1 -286.4C232 -270.1 231.9 -220.2 262.9 -191C294 -161.9 356.3 -153.5 385.2 -125.2C414.1 -96.8 409.5 -48.4 405 0L0 0Z" style={{ fill: "var(--color-accent-light)" }} />
          <path d="M0 -202.5C14.7 -179.7 29.3 -156.9 48.7 -149.8C68 -142.7 92.1 -151.4 104 -143.2C116 -135 115.9 -110.1 131.5 -95.5C147 -80.9 178.1 -76.8 192.6 -62.6C207 -48.4 204.8 -24.2 202.5 0L0 0Z" style={{ fill: "var(--color-accent)" }} />
        </g>
      </svg>
    </div>
  );
}

function WaveEffect() {
  const waveRef = useRef(null);
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(waveRef.current, { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" });
    }, rootRef);
    return () => context.revert();
  }, []);
  return (
    <div ref={rootRef} className="effect-shell">
      <svg viewBox="0 0 960 540" className="effect-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <path ref={waveRef} className="wave-path" d="M0 318L13.3 313.5C26.7 309 53.3 300 80 290.7C106.7 281.3 133.3 271.7 160 277C186.7 282.3 213.3 302.7 240 318.3C266.7 334 293.3 345 320 351.7C346.7 358.3 373.3 360.7 400 357.8C426.7 355 453.3 347 480 344C506.7 341 533.3 343 560 351.8C586.7 360.7 613.3 376.3 640 364.2C666.7 352 693.3 312 720 307.3C746.7 302.7 773.3 333.3 800 331C826.7 328.7 853.3 293.3 880 297C906.7 300.7 933.3 343.3 946.7 364.7L960 386L960 541L0 541Z" style={{ fill: "var(--color-accent-hover)" }} strokeLinecap="round" strokeLinejoin="miter" />
      </svg>
    </div>
  );
}

function BlobScatterEffect() {
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      [firstRef, secondRef, thirdRef].forEach((ref, index) => {
        gsap.fromTo(ref.current, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out", delay: 0.1 + index * 0.2 });
      });
    }, rootRef);
    return () => context.revert();
  }, []);
  return (
    <div ref={rootRef} className="effect-shell">
      <svg viewBox="0 0 960 540" className="effect-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g ref={firstRef} className="scatter-blob" transform="translate(162 77)"><path d="M97.1 -31.8C109.5 6.5 91.9 54.4 57.7 79.1C23.5 103.9 -27.2 105.5 -56.9 82.9C-86.5 60.2 -95.2 13.2 -82.2 -26C-69.3 -65.1 -34.6 -96.5 3.9 -97.8C42.4 -99.1 84.7 -70.2 97.1 -31.8Z" style={{ fill: "var(--color-accent-hover)" }} /></g>
        <g ref={secondRef} className="scatter-blob" transform="translate(229 491)"><path d="M62.3 -21.4C70.8 6 61 38.2 38.3 55.2C15.7 72.2 -19.8 74.1 -44.6 57.1C-69.5 40.1 -83.8 4.1 -74.6 -24.3C-65.4 -52.6 -32.7 -73.4 -2.9 -72.4C26.9 -71.5 53.8 -48.9 62.3 -21.4Z" style={{ fill: "var(--color-accent-hover)" }} /></g>
        <g ref={thirdRef} className="scatter-blob" transform="translate(821 180)"><path d="M93.2 -30.2C105 5.9 87.8 51.6 55 75.3C22.3 99 -26.1 100.7 -58.7 77.7C-91.4 54.7 -108.3 7 -95.9 -30C-83.5 -67 -41.8 -93.3 -0.5 -93.1C40.7 -93 81.5 -66.3 93.2 -30.2Z" style={{ fill: "var(--color-accent-hover)" }} /></g>
      </svg>
    </div>
  );
}

function LayeredPeaksEffect() {
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const fourthRef = useRef(null);
  const fifthRef = useRef(null);
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      [firstRef, secondRef, thirdRef, fourthRef, fifthRef].forEach((ref, index) => {
        gsap.fromTo(ref.current, { y: 300, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 + 0.15 * index });
      });
    }, rootRef);
    return () => context.revert();
  }, []);
  const paths = [
    ["M0 346L137 398L274 383L411 392L549 345L686 339L823 379L960 329L960 541L0 541Z", "var(--color-accent)", 1],
    ["M0 367L137 369L274 392L411 362L549 403L686 368L823 425L960 423L960 541L0 541Z", "var(--color-accent-hover)", 1],
    ["M0 394L137 403L274 402L411 405L549 416L686 440L823 442L960 435L960 541L0 541Z", "var(--color-accent-mid)", 1],
    ["M0 439L137 483L274 477L411 470L549 477L686 452L823 467L960 461L960 541L0 541Z", "var(--color-accent-mid)", 0.8],
    ["M0 480L137 498L274 503L411 500L549 500L686 514L823 493L960 516L960 541L0 541Z", "var(--color-accent-dark)", 1],
  ];
  const refs = [firstRef, secondRef, thirdRef, fourthRef, fifthRef];
  return (
    <div ref={rootRef} className="effect-shell">
      <svg viewBox="0 0 960 540" className="effect-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {paths.map(([d, fill, opacity], index) => <path className="layered-peak-path" key={d} ref={refs[index]} d={d} style={{ fill, opacity }} />)}
      </svg>
    </div>
  );
}

function LayeredStepsEffect() {
  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const fourthRef = useRef(null);
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      [firstRef, secondRef, thirdRef, fourthRef].forEach((ref, index) => {
        gsap.fromTo(ref.current, { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 + 0.15 * index });
      });
    }, rootRef);
    return () => context.revert();
  }, []);
  const paths = [
    ["M537 540L430 540L430 463L532 463L532 386L558 386L558 309L393 309L393 231L464 231L464 154L576 154L576 77L427 77L427 0L960 0L960 540Z", "var(--color-accent-dark)"],
    ["M608 540L626 540L626 463L611 463L611 386L684 386L684 309L644 309L644 231L632 231L632 154L623 154L623 77L558 77L558 0L960 0L960 540Z", "var(--color-accent-mid)"],
    ["M717 540L733 540L733 463L663 463L663 386L781 386L781 309L747 309L747 231L705 231L705 154L692 154L692 77L663 77L663 0L960 0L960 540Z", "var(--color-accent-mid)"],
    ["M766 540L851 540L851 463L844 463L844 386L773 386L773 309L838 309L838 231L814 231L814 154L794 154L794 77L797 77L797 0L960 0L960 540Z", "var(--color-accent-dark)"],
  ];
  const refs = [firstRef, secondRef, thirdRef, fourthRef];
  return (
    <div ref={rootRef} className="effect-shell">
      <svg viewBox="0 0 960 540" className="effect-svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        {paths.map(([d, fill], index) => <path className="layered-step-path" key={d} ref={refs[index]} d={d} style={{ fill }} />)}
      </svg>
    </div>
  );
}

function WorldMapEffect() {
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(".world-map-layer", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: reduceMotion ? 0.01 : 1.5, ease: "power2.out" });
    }, rootRef);
    return () => context.revert();
  }, []);
  return (
    <div ref={rootRef} className="effect-shell">
      <div className="world-map-layer" />
    </div>
  );
}

function BackgroundWords() {
  const [items, setItems] = useState([]);
  const countRef = useRef(0);
  const removalTimers = useRef(new Set());

  useEffect(() => {
    countRef.current = items.length;
  }, [items.length]);

  useEffect(() => {
    const timers = removalTimers.current;
    const spawn = () => {
      if (countRef.current >= 1) return;
      const item = {
        id: `word-${Date.now()}-${Math.random()}`,
        text: words[Math.floor(Math.random() * words.length)],
        x: 10 + Math.random() * 70,
        y: 10 + Math.random() * 70,
        color: wordColors[Math.floor(Math.random() * wordColors.length)],
      };
      setItems((current) => [...current, item]);
      const removalTimer = window.setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        removalTimers.current.delete(removalTimer);
      }, 3500);
      removalTimers.current.add(removalTimer);
    };
    const timer = window.setInterval(spawn, 3000);
    return () => {
      window.clearInterval(timer);
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  return (
    <div className="background-words">
      {items.map((word) => <AnimatedWord key={word.id} word={word} />)}
    </div>
  );
}

function AnimatedWord({ word }) {
  const ref = useRef(null);
  useEffect(() => {
    let split;
    let timeline;
    let active = true;
    import("split-type").then((splitModule) => {
      if (!active || !ref.current) return;
      const SplitType = splitModule.default;
      split = new SplitType(ref.current, { types: "chars" });
      if (!split.chars) return;
      timeline = gsap.timeline();
      timeline.fromTo(split.chars, { opacity: 0 }, { opacity: 1, duration: 0.1, stagger: 0.1, ease: "none" });
      timeline.to({}, { duration: 1.5 });
      timeline.to(split.chars, { opacity: 0, duration: 0.1, stagger: { each: 0.05, from: "end" }, ease: "none" });
    });
    return () => {
      active = false;
      timeline?.kill();
      split?.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="background-word"
      style={{
        left: `${word.x}%`,
        top: `${word.y}%`,
        color: word.color,
        WebkitTextStroke: `2px ${word.color}`,
      }}
    >
      {word.text}
    </div>
  );
}
