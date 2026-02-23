import { useState } from "react";
import DominoSection from "./DominoSection";
import { Badge, S } from "../styles";
import { ALOS_COMPONENTS } from "../data/alos-components";
import { DOMINOS } from "../data/dominos";
import { PRODUCTS } from "../data/products";
import { REVENUE_SCENARIOS } from "../data/revenue";
import { TWITTER_PILLARS } from "../data/twitter";

export default function CommandCenter() {
  const [section, setSection] = useState("lucidbox");
  const [subTab, setSubTab] = useState("products");
  const [activeDominos, setActiveDominos] = useState(new Set([1]));
  const [expandedProduct, setExpandedProduct] = useState(3);

  const toggleDomino = (id) => { setActiveDominos(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  // Signal calculations
  const totalSig = DOMINOS.reduce((s, d) => s + d.signals.length, 0);
  const amberCt = DOMINOS.reduce((s, d) => s + d.signals.filter(x => x.currentStatus === "amber").length, 0);
  const redCt = DOMINOS.reduce((s, d) => s + d.signals.filter(x => x.currentStatus === "red").length, 0);
  const greenCt = totalSig - amberCt - redCt;
  const threat = redCt >= 6 ? "CRISIS" : redCt >= 3 ? "CRITICAL" : amberCt >= 12 ? "ELEVATED" : amberCt >= 6 ? "WATCH" : "BASELINE";
  const threatClr = threat === "CRISIS" || threat === "CRITICAL" ? "#E63946" : threat === "ELEVATED" ? "#F4A261" : threat === "WATCH" ? "#E9C46A" : "#2A9D8F";

  const statusLabels = { launch_now: "LAUNCH NOW", build_this_month: "THIS MONTH", launch_month_2: "MONTH 2", launch_quarter_2: "Q2", launch_quarter_3: "Q3", build_quarter_3: "BUILD Q3" };
  const statusColors = { launch_now: "#E63946", build_this_month: "#F4A261", launch_month_2: "#E9C46A", launch_quarter_2: "#2A9D8F", launch_quarter_3: "#6D6875", build_quarter_3: "#264653" };

  // Set appropriate sub-tab when switching sections
  const switchSection = (s) => {
    setSection(s);
    if (s === "lucidbox") setSubTab("products");
    else setSubTab("dominos");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0F", color: "#E8E4DF", fontFamily: "'IBM Plex Sans', -apple-system, sans-serif", padding: "20px 14px" }}>

      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        {/* Master Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 24, background: "linear-gradient(180deg, #E9C46A, #E63946)", borderRadius: 2 }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.8px" }}>Asymmetric Bridge</h1>
            <span style={{ fontSize: 9, color: "#E9C46A", background: "#E9C46A15", padding: "2px 8px", borderRadius: 4, fontWeight: 600, marginLeft: 6 }}>COMMAND CENTER</span>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 11, fontFamily: "'IBM Plex Mono'" }}>Lucid Box Products · Signal Tracker · ALOS Productization · Revenue Model · Twitter Strategy</p>
        </div>

        {/* Section Switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => switchSection("lucidbox")} style={S.sectionTab(section === "lucidbox", "#E63946")}>
            Lucid Box Business
          </button>
          <button onClick={() => switchSection("signals")} style={S.sectionTab(section === "signals", "#E9C46A")}>
            Signal Tracker
            <span style={{ marginLeft: 6, fontSize: 9, color: threatClr, fontWeight: 700 }}>{threat}</span>
          </button>
        </div>

        {/* ================= LUCID BOX SECTION ================= */}
        {section === "lucidbox" && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { id: "products", label: "Products", c: "#E63946" },
                { id: "alos", label: "ALOS → Products", c: "#2A9D8F" },
                { id: "twitter", label: "Twitter/X", c: "#1DA1F2" },
                { id: "revenue", label: "Revenue", c: "#F4A261" },
                { id: "content", label: "Content", c: "#E9C46A" },
              ].map(t => <button key={t.id} onClick={() => setSubTab(t.id)} style={S.tab(subTab === t.id, t.c)}>{t.label}</button>)}
            </div>

            {/* PRODUCTS */}
            {subTab === "products" && (
              <div>
                <div style={{ ...S.card("rgba(255,255,255,0.06)"), padding: "14px", marginBottom: 14 }}>
                  <div style={S.label}>Product Ladder (Click to Expand)</div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 100, padding: "0 4px", marginTop: 8 }}>
                    {PRODUCTS.map((p, i) => {
                      const h = [12, 28, 42, 58, 68, 80, 88, 100];
                      return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }} onClick={() => setExpandedProduct(expandedProduct === i ? -1 : i)}>
                          <div style={{ fontSize: 8, color: p.color, fontWeight: 600, fontFamily: "'IBM Plex Mono'", textAlign: "center", maxWidth: 50 }}>{p.price.split(' ')[0]}</div>
                          <div style={{ width: 30, height: `${h[i]}%`, minHeight: 10, background: `linear-gradient(180deg, ${p.color}88, ${p.color}33)`, borderRadius: "3px 3px 0 0", border: `1px solid ${expandedProduct === i ? p.color : `${p.color}44`}`, transition: "all 0.2s" }} />
                          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", textAlign: "center", maxWidth: 50, lineHeight: 1.1 }}>{p.tier}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {PRODUCTS.map((p, i) => (
                  <div key={i} style={{ ...S.card(expandedProduct === i ? `${p.color}33` : "rgba(255,255,255,0.04)"), cursor: "pointer", opacity: expandedProduct !== -1 && expandedProduct !== i ? 0.45 : 1, transition: "all 0.2s" }} onClick={() => setExpandedProduct(expandedProduct === i ? -1 : i)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 2, background: p.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{p.tier}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Badge text={statusLabels[p.status]} color={statusColors[p.status]} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.price}</span>
                      </div>
                    </div>
                    {expandedProduct === i && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 8 }}>{p.description}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                          <div><div style={S.label}>Format</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{p.format}</div></div>
                          <div><div style={S.label}>Margin</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{p.margin}</div></div>
                          <div><div style={S.label}>Volume</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{p.volume}</div></div>
                        </div>
                        <div style={{ background: `${p.color}08`, borderLeft: `2px solid ${p.color}33`, padding: "6px 10px", borderRadius: "0 5px 5px 0" }}>
                          <div style={{ fontSize: 9, color: p.color, fontWeight: 600, letterSpacing: "0.8px" }}>ALOS CONNECTION</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{p.alos}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ALOS PRODUCTIZATION */}
            {subTab === "alos" && (
              <div>
                <div style={{ ...S.card("#2A9D8F33"), marginBottom: 14 }}>
                  <div style={S.label}>ALOS Current State</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 6 }}>
                    {[["9", "Agents"], ["29+", "Skills"], ["50+", "Claude Projects"], ["50+", "Premium Workflows"], ["Kosha Prime", "Obsidian Vault"], ["3", "Integrations"]].map(([v, l], i) => (
                      <div key={i} style={{ textAlign: "center", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: 5 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#2A9D8F" }}>{v}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.label}>Productizable Components</div>
                {ALOS_COMPONENTS.map((c, i) => (
                  <div key={i} style={S.card("rgba(255,255,255,0.06)")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                      <Badge text={c.readiness} color={c.readiness === "HIGHEST" || c.readiness === "HIGH" ? "#2A9D8F" : c.readiness === "MEDIUM" ? "#E9C46A" : "#F4A261"} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{c.desc}</div>
                    <div style={{ fontSize: 10, color: "#E9C46A", fontStyle: "italic", background: "#E9C46A08", padding: "5px 8px", borderRadius: 4 }}>Demo: {c.demo}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TWITTER */}
            {subTab === "twitter" && (
              <div>
                <div style={{ ...S.card("#1DA1F233"), marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                    <strong style={{ color: "#1DA1F2" }}>Purpose:</strong> AI Twitter = lab credibility + job inbound. LinkedIn = consulting leads.
                    <br /><strong style={{ color: "#1DA1F2" }}>Cost:</strong> $8/mo Premium. Upgrade at 500+ followers.
                  </div>
                </div>
                <div style={S.label}>Content Pillars</div>
                {TWITTER_PILLARS.map((p, i) => (
                  <div key={i} style={S.card("rgba(255,255,255,0.06)")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1DA1F2" }}>{p.pillar}</span>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono'" }}>{p.freq}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>→ {p.target}</div>
                    {p.examples.map((e, ei) => (
                      <div key={ei} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", padding: "5px 8px", background: "rgba(255,255,255,0.02)", borderRadius: 4, marginBottom: 3, borderLeft: "2px solid #1DA1F222", lineHeight: 1.4 }}>{e}</div>
                    ))}
                  </div>
                ))}
                <div style={S.label}>Growth Tactics</div>
                <div style={S.card("rgba(255,255,255,0.06)")}>
                  {["Reply to @AnthropicAI, @OpenAI, @ClaudeCode with substantive technical commentary", "Quote-tweet AI researchers with your builder perspective", "Engage with @swyx, @karpathy — the 'build with AI' community", "Post Claude Code terminal output — builders love seeing real workflows", "Cross-post LinkedIn hits to Twitter thread format"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "4px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                      <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#1DA1F255", marginTop: 5, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVENUE */}
            {subTab === "revenue" && (
              <div>
                <div style={S.label}>6-Month Lucid Box Revenue Projections</div>
                {REVENUE_SCENARIOS.map((s, si) => {
                  const totals = s.months.map(m => m.pd + m.ws + m.dg + m.ent + m.ret);
                  const cum = totals.reduce((a, t) => { a.push((a.length > 0 ? a[a.length - 1] : 0) + t); return a; }, []);
                  return (
                    <div key={si} style={{ ...S.card(`${s.color}22`), marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: s.color, marginBottom: 8 }}>{s.scenario}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "40px repeat(5, 1fr) 55px 60px", gap: 0, fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center", fontFamily: "'IBM Plex Mono'", marginBottom: 3 }}>
                        <div>Mo</div><div>PwrDay</div><div>Wkshp</div><div>Digital</div><div>Enterp</div><div>Retain</div><div>Total</div><div>Cum.</div>
                      </div>
                      {s.months.map((m, mi) => (
                        <div key={mi} style={{ display: "grid", gridTemplateColumns: "40px repeat(5, 1fr) 55px 60px", gap: 0, fontSize: 10, textAlign: "center", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)" }}>
                          <div style={{ color: "rgba(255,255,255,0.3)" }}>{m.m}</div>
                          <div>${(m.pd/1000).toFixed(1)}K</div>
                          <div>${(m.ws/1000).toFixed(1)}K</div>
                          <div>${(m.dg/1000).toFixed(1)}K</div>
                          <div>${(m.ent/1000).toFixed(0)}K</div>
                          <div>${(m.ret/1000).toFixed(0)}K</div>
                          <div style={{ fontWeight: 600, color: s.color }}>${(totals[mi]/1000).toFixed(1)}K</div>
                          <div style={{ fontWeight: 700, color: s.color }}>${(cum[mi]/1000).toFixed(0)}K</div>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "6px 10px", background: `${s.color}08`, borderRadius: 5 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>6-month total</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>${(cum[5]/1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  );
                })}
                <div style={S.card("rgba(255,255,255,0.06)")}>
                  <div style={S.label}>Combined Annual Income at Moderate</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                    <div><span style={{ color: "#E63946", fontWeight: 600 }}>Intuit:</span> $200-250K</div>
                    <div><span style={{ color: "#E63946", fontWeight: 600 }}>Lucid Box:</span> $150-300K</div>
                    <div><span style={{ color: "#E63946", fontWeight: 600 }}>Digital + Course:</span> $50-120K (passive)</div>
                    <div><span style={{ color: "#E63946", fontWeight: 600 }}>Retainers:</span> $36-60K (recurring)</div>
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: "#E9C46A" }}>Total: $450-700K/year → $1M net worth in ~2 years</div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT */}
            {subTab === "content" && (
              <div>
                <div style={{ ...S.card("#E9C46A22"), marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                    ALOS produces content → Content builds audience → Audience converts to customers → Customer results become content. Every piece simultaneously: Lucid Box marketing, ALOS proof, lab credibility, signal analysis.
                  </div>
                </div>
                <div style={S.label}>Weekly Content Calendar (~2 hrs total)</div>
                <div style={S.card("rgba(255,255,255,0.06)")}>
                  {[
                    { day: "Monday", plat: "LinkedIn", platClr: "#0A66C2", type: "Enterprise AI insight from Intuit work" },
                    { day: "Tuesday", plat: "Twitter", platClr: "#1DA1F2", type: "Build-in-public: what you shipped this week" },
                    { day: "Wednesday", plat: "Twitter", platClr: "#1DA1F2", type: "ALOS showcase or workflow demo" },
                    { day: "Thursday", plat: "LinkedIn", platClr: "#0A66C2", type: "Teaching post: how to do X with Claude Code" },
                    { day: "Friday", plat: "Twitter", platClr: "#1DA1F2", type: "Signal analysis or macro observation" },
                    { day: "Weekend", plat: "Blog", platClr: "#E9C46A", type: "Monthly long-form (signal update or ALOS deep dive)" },
                  ].map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 60px 1fr", gap: 6, alignItems: "center", padding: "8px 6px", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{c.day}</span>
                      <span style={{ fontSize: 9, color: c.platClr, fontWeight: 600 }}>{c.plat}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{c.type}</span>
                    </div>
                  ))}
                </div>
                <div style={{ ...S.card("rgba(255,255,255,0.06)"), marginTop: 8 }}>
                  <div style={S.label}>Content → Product Funnel</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                    {[
                      { s: "Free Content", c: "#6D6875" }, { s: "Email List", c: "#2A9D8F" }, { s: "Digital $29-97", c: "#E9C46A" },
                      { s: "Workshop $297-497", c: "#F4A261" }, { s: "Power Day $3K", c: "#E63946" }, { s: "Enterprise $8-15K", c: "#9B2226" },
                    ].map((x, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: x.c }}>{x.s}</span>
                        {i < 5 && <span style={{ margin: "0 4px", color: "rgba(255,255,255,0.1)" }}>→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SIGNALS SECTION ================= */}
        {section === "signals" && (
          <div>
            {/* Overall Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              <div style={{ background: `linear-gradient(135deg, ${threatClr}15, ${threatClr}08)`, border: `1px solid ${threatClr}33`, borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6, fontFamily: "'IBM Plex Mono'" }}>Threat Level</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: threatClr, letterSpacing: "1px" }}>{threat}</div>
              </div>
              {[{ l: "Baseline", c: greenCt, clr: "#2A9D8F" }, { l: "Watch", c: amberCt, clr: "#F4A261" }, { l: "Alert", c: redCt, clr: "#E63946" }].map(x => (
                <div key={x.l} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6, fontFamily: "'IBM Plex Mono'" }}>{x.l}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: x.clr }}>{x.c}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>of {totalSig}</div>
                </div>
              ))}
            </div>

            {/* Cascade */}
            <div style={{ marginBottom: 20, padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <div style={{ ...S.label, marginBottom: 12 }}>Domino Cascade</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {DOMINOS.map((d, i) => {
                  const sc = { green: 0, amber: 0, red: 0 };
                  d.signals.forEach(s => sc[s.currentStatus]++);
                  const heat = (sc.red * 2 + sc.amber) / (d.signals.length * 2);
                  return (
                    <div key={d.id} style={{ display: "flex", alignItems: "center" }}>
                      <div onClick={() => toggleDomino(d.id)} style={{ width: 48, height: 48, borderRadius: "50%", background: `radial-gradient(circle, ${d.color}${Math.round(heat * 80 + 20).toString(16).padStart(2, '0')}, transparent)`, border: `2px solid ${d.color}${Math.round(heat * 200 + 55).toString(16).padStart(2, '0')}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.id}</span>
                        {heat > 0.5 && <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: heat > 0.75 ? "#E63946" : "#F4A261", boxShadow: `0 0 5px ${heat > 0.75 ? "#E63946" : "#F4A261"}` }} />}
                      </div>
                      {i < DOMINOS.length - 1 && <div style={{ width: 30, height: 2, background: `linear-gradient(90deg, ${d.color}44, ${DOMINOS[i + 1].color}44)`, margin: "0 3px" }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 2px" }}>
                {DOMINOS.map(d => <div key={d.id} style={{ width: 48, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono'" }}>{d.name.split(" ")[0]}</div>)}
              </div>
            </div>

            {/* Domino Sections */}
            {DOMINOS.map(d => <DominoSection key={d.id} domino={d} isActive={activeDominos.has(d.id)} onToggle={() => toggleDomino(d.id)} />)}

            <div style={{ marginTop: 16, padding: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              <strong style={{ color: "rgba(255,255,255,0.45)" }}>How to Use:</strong> Update signal statuses as new data arrives. Green = baseline. Amber = approaching threshold. Red = threshold breached. Track monthly; weekly during earnings season.
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, padding: "10px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.12)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          Asymmetric Bridge Command Center v3.0 · Lucid Box + Signal Tracker · Feb 22, 2026 · Not financial advice
        </div>
      </div>
    </div>
  );
}
