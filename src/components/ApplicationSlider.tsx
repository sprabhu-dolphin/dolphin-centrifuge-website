import { useState, useRef, useEffect } from "react";

const apps = [
  { id: 1, t: "Wastewater", s: "Clarification & Purification", d: "Municipal & industrial sludge dewatering, effluent treatment, food processing wastewater", g: "linear-gradient(160deg,#2a3325 0%,#3d4a2e 30%,#4a5438 60%,#3a4530 100%)", ac: "#8aad6e", gc: "rgba(138,173,110,0.35)", oc: "rgba(74,84,56,0.4)", to: 0.06, url: "/wastewater-centrifuge/" },
  { id: 2, t: "Used Motor Oil", s: "Mineral Oil Recovery", d: "Re-refining, crankcase drainings, mineral oil recycling, fleet waste oil processing", g: "linear-gradient(160deg,#0d0d0d 0%,#1a1a1a 30%,#222 60%,#151515 100%)", ac: "#999", gc: "rgba(153,153,153,0.3)", oc: "rgba(30,30,30,0.5)", to: 0.04, url: "/used-oil-centrifuge/" },
  { id: 3, t: "Waste Veggie Oil", s: "UCO & WVO Processing", d: "WVO, UCO, yellow grease, brown grease, biodiesel feedstock preparation", g: "linear-gradient(160deg,#4a3510 0%,#6b4d18 30%,#7d5a1c 60%,#5c4214 100%)", ac: "#e8b84a", gc: "rgba(232,184,74,0.3)", oc: "rgba(125,90,28,0.35)", to: 0.05, url: "/wvo-centrifuge-separator/" },
  { id: 4, t: "Water-Based Fluids", s: "Coolant & Metalworking", d: "Machining coolant, stamping coolant, synthetic & semi-synthetic metalworking fluids", g: "linear-gradient(160deg,#d4ddd0 0%,#c8d8c0 30%,#b8ccb0 60%,#c2d4ba 100%)", ac: "#3a5e34", gc: "rgba(58,94,52,0.35)", oc: "rgba(180,204,170,0.3)", to: 0.05, url: "/machine-coolant-centrifuge/", dk: true },
  { id: 5, t: "Oil-Based Fluids", s: "Quench, Cutting & Draw", d: "Quench oil, cutting oil, draw oil, rolling oil, tapping oil, heat treating fluids", g: "linear-gradient(160deg,#3a1a0e 0%,#5c2a14 30%,#6e3018 60%,#4a2210 100%)", ac: "#e07040", gc: "rgba(224,112,64,0.3)", oc: "rgba(110,48,24,0.35)", to: 0.05, url: "/cutting-oil-centrifuge/" },
  { id: 6, t: "Industrial Oils", s: "Lube, Hydraulic & Gear", d: "Turbine lube oil, hydraulic oil, compressor oil, transformer oil, gear oil purification", g: "linear-gradient(160deg,#5c4a18 0%,#7a6420 30%,#8c7428 60%,#6a5420 100%)", ac: "#e8cc5a", gc: "rgba(232,204,90,0.3)", oc: "rgba(140,116,40,0.3)", to: 0.05, url: "/lube-oil-centrifuge/" },
  { id: 7, t: "Fuels", s: "Diesel, HFO & Kerosene", d: "Diesel polishing, heavy fuel oil, kerosene, marine fuel, generator fuel systems", g: "linear-gradient(160deg,#3a3020 0%,#504530 30%,#5c5038 60%,#443a28 100%)", ac: "#d4b878", gc: "rgba(212,184,120,0.3)", oc: "rgba(92,80,56,0.35)", to: 0.05, url: "/diesel-centrifuge/" },
  { id: 8, t: "Crude Oil", s: "Tank Bottoms & BS&W", d: "Tank bottoms, refinery slop, condensate, produced water, OBM, BS&W recovery", g: "linear-gradient(160deg,#18100a 0%,#2a1c0e 30%,#342212 60%,#20160c 100%)", ac: "#c49044", gc: "rgba(196,144,68,0.35)", oc: "rgba(52,34,18,0.4)", to: 0.04, url: "/crude-oil-centrifuge/" },
];

const W = 310, G = 16, CT = W + G, SP = 0.8;

export default function ApplicationSlider() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const scrollPos = useRef(0);
  const pausedRef = useRef(false);
  const manScr = useRef(false);
  const manTmr = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anyHovered = hoveredId !== null;

  const tripled = [...apps, ...apps, ...apps];
  const singleWidth = apps.length * CT;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    scrollPos.current = singleWidth;
    el.scrollLeft = singleWidth;

    const tick = () => {
      if (!pausedRef.current && !manScr.current) {
        scrollPos.current += SP;
        if (scrollPos.current >= singleWidth * 2) scrollPos.current -= singleWidth;
        el.scrollLeft = scrollPos.current;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (manTmr.current) clearTimeout(manTmr.current);
    };
  }, [singleWidth]);

  const manualScroll = (dir: number) => {
    manScr.current = true;
    const el = scrollRef.current;
    if (!el) return;
    scrollPos.current = el.scrollLeft;
    el.scrollTo({ left: scrollPos.current + dir * CT * 2, behavior: "smooth" });
    if (manTmr.current) clearTimeout(manTmr.current);
    manTmr.current = setTimeout(() => {
      scrollPos.current = el.scrollLeft;
      if (scrollPos.current >= singleWidth * 2) {
        scrollPos.current -= singleWidth;
        el.scrollLeft = scrollPos.current;
      } else if (scrollPos.current <= 0) {
        scrollPos.current += singleWidth;
        el.scrollLeft = scrollPos.current;
      }
      manScr.current = false;
    }, 500);
  };

  return (
    <div style={{
      background: "#0c0c0c", padding: "52px 0 48px",
      fontFamily: "'Plus Jakarta Sans','DM Sans','Segoe UI',sans-serif",
      overflow: "hidden", userSelect: "none",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto 32px", padding: "0 48px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ color: "#E8A317", fontSize: 12, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 10 }}>
            Centrifuge Applications
          </p>
          <h2 style={{ color: "#f0f0f0", fontSize: 34, fontWeight: 300, lineHeight: 1.15, margin: 0, letterSpacing: "-0.5px" }}>
            Industrial Separation Solutions
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {([-1, 1] as const).map(d => (
            <button key={d} onClick={() => manualScroll(d)} style={{
              width: 44, height: 44, borderRadius: 22,
              border: "1.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.06)", color: "#ccc",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", transition: "all .2s",
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d={d === -1 ? "M10 3L5 8L10 13" : "M6 3L11 8L6 13"}
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div
        style={{ position: "relative" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; setHoveredId(null); }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg,#0c0c0c,transparent)", zIndex: 20, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(270deg,#0c0c0c,transparent)", zIndex: 20, pointerEvents: "none" }} />

        <div ref={scrollRef} style={{
          display: "flex", gap: G, overflowX: "hidden", padding: "16px 48px 24px",
        }}>
          {tripled.map((a, i) => {
            const ih = hoveredId === a.id;
            const dm = anyHovered && !ih;
            const dark = !(a as any).dk;

            return (
              <a
                key={i}
                href={a.url}
                onMouseEnter={() => setHoveredId(a.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "relative", borderRadius: 14, overflow: "hidden",
                  cursor: "pointer", background: a.g, minWidth: W, width: W,
                  height: 380, flexShrink: 0, textDecoration: "none",
                  opacity: dm ? 0.4 : 1,
                  filter: dm ? "brightness(0.55)" : "brightness(1)",
                  boxShadow: ih
                    ? `0 0 0 2.5px ${a.ac},0 0 35px ${a.gc},0 8px 40px rgba(0,0,0,0.6)`
                    : "0 2px 16px rgba(0,0,0,0.4)",
                  transition: "box-shadow .4s ease,opacity .3s ease,filter .3s ease",
                }}
              >
                <div style={{ position: "absolute", inset: 0, opacity: a.to, pointerEvents: "none",
                  backgroundImage: `radial-gradient(ellipse at 30% 20%,rgba(${dark?"255,255,255":"0,0,0"},0.3) 0%,transparent 60%),radial-gradient(ellipse at 70% 70%,rgba(${dark?"255,255,255":"0,0,0"},0.2) 0%,transparent 50%)`,
                }} />
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `radial-gradient(ellipse at 65% 45%,${a.oc},transparent 70%)`,
                  opacity: ih ? 0.9 : 0.4, transition: "opacity .5s",
                }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
                  pointerEvents: "none", zIndex: 1,
                  background: dark
                    ? "linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 50%,transparent 100%)"
                    : "linear-gradient(to top,rgba(255,255,255,0.65) 0%,rgba(255,255,255,0.2) 50%,transparent 100%)",
                }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "0 28px 28px" }}>
                  <div style={{ height: 34, display: "flex", alignItems: "flex-end" }}>
                    <h3 style={{
                      color: dark ? "#fff" : "#1a1a1a", fontSize: 26, fontWeight: 800,
                      lineHeight: 1.15, margin: 0, letterSpacing: "-0.4px",
                      textShadow: dark ? "0 2px 14px rgba(0,0,0,0.7)" : "0 1px 6px rgba(255,255,255,0.4)",
                    }}>{a.t}</h3>
                  </div>
                  <div style={{ height: 28, display: "flex", alignItems: "flex-start", paddingTop: 2 }}>
                    <p style={{
                      color: a.ac, fontSize: 20, fontWeight: 700, lineHeight: 1.2,
                      margin: 0, letterSpacing: "-0.2px",
                      textShadow: dark ? "0 2px 10px rgba(0,0,0,0.5)" : "none",
                    }}>{a.s}</p>
                  </div>
                  <div style={{ height: 18, display: "flex", alignItems: "center" }}>
                    <div style={{
                      height: 2.5, borderRadius: 2, background: a.ac,
                      opacity: ih ? 0.9 : 0.4, width: "100%",
                      maxWidth: ih ? 400 : 32,
                      transition: "max-width .4s cubic-bezier(.22,1,.36,1),opacity .4s",
                    }} />
                  </div>
                  <div style={{ height: 62, overflow: "hidden" }}>
                    <p style={{
                      color: ih
                        ? (dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)")
                        : (dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)"),
                      fontSize: 13.5, lineHeight: 1.5, margin: 0, transition: "color .4s",
                    }}>{a.d}</p>
                  </div>
                  <div style={{ height: 36, display: "flex", alignItems: "center" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      color: a.ac, fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.5px", textTransform: "uppercase" as const,
                      opacity: ih ? 1 : 0,
                      transition: "opacity .35s ease .05s",
                    }}>
                      View Application
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{
                        transform: ih ? "translateX(3px)" : "translateX(0)", transition: "transform .3s",
                      }}><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                </div>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, height: 3,
                  background: ih ? a.ac : `linear-gradient(90deg,transparent,${a.ac},transparent)`,
                  opacity: ih ? 1 : 0.15, transition: "opacity .4s",
                  boxShadow: ih ? `0 0 16px ${a.gc}` : "none",
                }} />
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "32px auto 0", padding: "0 48px", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
          {"Don't see your application? "}
          <a href="/contact-for-alfa-laval-centrifuges/" style={{ color: "#E8A317", fontWeight: 600, textDecoration: "none" }}>
            Contact us
          </a>
          {" \u2014 we've handled hundreds of unique separation challenges."}
        </p>
      </div>
    </div>
  );
}
