import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function animationDirective(intensity: number): string {
  if (intensity < 25) return `Use SUBTLE animations only: gentle fade-ins (opacity transitions over 800ms), soft scale-ins. No bouncing or large movements. Keep it professional and restrained.`;
  if (intensity < 50) return `Use BALANCED animations: smooth fade-in + slide-up for hero, staggered card entrances, gentle hover scale on buttons. IntersectionObserver for scroll-reveal. Nothing too flashy.`;
  if (intensity < 75) return `Use BOLD animations: parallax scroll depth effects, mouse-follow subtle glow on hero section, interactive card tilt (CSS perspective transform on mousemove), scroll progress indicator bar at top, micro-interaction scale/color on button hover, staggered reveals with spring easing.`;
  return `Use EXPERIMENTAL animations: magnetic buttons (elements that follow cursor within radius then snap back), parallax scroll depth on multiple layers, mouse-follow glowing orb, 3D card tilt with perspective and lighting shifts, scroll progress indicator, kinetic typography in hero, morphing background shapes, particle effects on CTA hover, split-screen reveal animations.`;
}

function layoutDirective(complexity: number): string {
  if (complexity < 25) return `Use a SIMPLE layout: single-column, generous whitespace, clear visual hierarchy. Standard section stacking — but never centered with two buttons (cliche).`;
  if (complexity < 50) return `Use a STRUCTURED layout: 2-column zig-zag for features, alternating left-right sections, 12-column CSS Grid. Avoid 3-equal-card feature rows — that pattern is banned.`;
  if (complexity < 75) return `Use an ASYMMETRIC layout: offset grids, overlapping elements with z-index layering, mixed column widths, broken-grid sections, large numerals as section markers, eyebrow labels in small caps.`;
  return `Use an EDITORIAL GRID layout: CSS Grid with named areas, magazine-style mixed layouts, full-bleed hero with inset content, masonry feature grids, marginalia/sidebar callouts, asymmetric image placement, oversized typography mixed with body copy.`;
}

function modernDirective(level: number): string {
  if (level < 25) return `Use a TIMELESS design: classic typography, subtle shadows, conventional buttons. Nothing trendy.`;
  if (level < 50) return `Use a MODERN design: tight radii (4-8px, NOT pill-shaped), tinted shadows (not pure black), clean spacing, ONE accent color.`;
  if (level < 75) return `Use a TRENDY EDITORIAL design: pair a serif display font (Instrument Serif, Fraunces, Cabinet Grotesk) with a clean sans (Geist, Inter), fluid clamp() type, eyebrow labels in tracking-wider uppercase, hairline dividers, text-balance on headlines, subtle grain overlay.`;
  return `Use a FUTURISTIC EDITORIAL design: monospace + serif display pairing, off-black backgrounds (#0a0a0a not #000), tinted shadows matching background hue, kinetic display type, marginalia layout, oversized lowercase headers.`;
}

function goalDirective(goal: string): string {
  const map: Record<string, string> = {
    "hire": `Optimize for HIRING: Lead with the strongest project case study (image + outcome metric), not a generic intro. Skills shown as a tagged inventory, not progress bars. Timeline of work with named companies. One direct mailto: CTA — no "let's talk" softness. Real social links.`,
    "sell": `Optimize for SELLING: Lead with the #1 outcome the buyer cares about. Pricing section with 3 tiers, recommended tier highlighted via color/border NOT just extra height. Logo bar with real-feeling brand names. FAQ as a 2-column list (NOT an accordion — accordions are banned). Multiple specific CTAs.`,
    "collect-emails": `Optimize for EMAIL COLLECTION: Hero CTA is an email input + submit. Specific lead magnet ("Get the 12-page Q4 teardown"). Trust badge with subscriber count using realistic odd numbers (e.g. 8,247 not 10,000). Privacy line in small caps.`,
    "impress": `Optimize for IMPRESSION: Hero is a single hero image or kinetic typographic statement. Case studies as full-bleed visuals with metric callouts. Awards as a hairline-separated list, not badge soup. Editorial spacing.`,
    "inform": `Optimize for INFORMATION: Scannable sections with numbered eyebrow labels. Comparison tables with real data. "How it works" as numbered steps in a horizontal scroll or zig-zag, NOT 3 cards.`,
  };
  return map[goal] || map["sell"];
}

function tonesDirective(tones: string[]): string {
  if (!tones || !tones.length) return "";
  const map: Record<string, string> = {
    "trust": "Calm, measured language. Real-sounding testimonials with full names + companies. Security/compliance mentions where relevant.",
    "excitement": "Energetic specific verbs — Ship, Launch, Compose, Cut, Replace. Higher motion. Bolder color contrast.",
    "authority": "Definitive language. Data with sources. Fewer adjectives. Premium serif typography. Restrained palette.",
    "warmth": "Conversational, first-person plural. Rounded radii. Warmer accent. Human-scale photography.",
    "urgency": "Time-bound CTAs. Specific dates. Scarcity ('48 spots left, closes Friday') NOT vague 'limited time'.",
  };
  const lines = tones.map((t) => `- ${t.toUpperCase()}: ${map[t] ?? ""}`).join("\n");
  return `BLEND THESE TONES (the page should feel like all of them at once, not one section per tone):\n${lines}`;
}

// === TASTE SKILL — baked-in audit. Banned patterns are HARD failures. ===
const TASTE_DIRECTIVE = `
DESIGN TASTE — TASTE-SKILL ENFORCEMENT (every rule below is mandatory).

TYPOGRAPHY:
- NEVER use Inter alone. Pair a display font (Instrument Serif, Fraunces, Cabinet Grotesk, or Space Grotesk) with a clean body font (Geist, Inter as body only).
- Headlines must feel HEAVY: clamp() fluid sizing, hero clamp(2.5rem, 6vw, 6rem), tight tracking (-0.02em), line-height 0.95–1.05.
- Use 4 weights (300/400/500/700) — never just 400 + 700.
- Body text max 65ch wide. Line-height 1.6+.
- Numbers in tabular figures: font-variant-numeric: tabular-nums.
- Use text-wrap: balance on h1/h2 and text-wrap: pretty on paragraphs.
- Sentence case for headers — NOT Title Case On Every Word.
- Eyebrow labels: small caps, tracking 0.18em, muted.

COLOR & SURFACES:
- NEVER use pure #000 or pure #FFF backgrounds. Use off-black (#0a0a0a, #0f0e0c) and warm cream (#f7f3ec) instead.
- ONE accent color only. Saturation under 75%. Tint shadows with the background hue (no rgba(0,0,0,X) — use the dark accent color at low opacity).
- BANNED: purple-to-blue gradient, "AI gradient" aesthetic, neon pink, electric purple. Use earthy/warm or cool desaturated tones instead.
- Add a subtle SVG noise/grain overlay at 3-5% opacity to fight flat AI-look.
- Mesh gradients only when intentional, never as default hero background.
- No random dark section in a light page (or vice versa).

LAYOUT:
- BANNED: Centered hero with one big headline + two buttons. BANNED: Three equal cards in a feature row. BANNED: Glassmorphism cards as the dominant pattern.
- Use 12-column CSS Grid. Asymmetric at least once. Mix column widths.
- min-height: 100dvh (not 100vh) for full-screen sections.
- Container max-width 1200–1440px with auto margins.
- Generous breathing room: section padding clamp(4rem, 10vw, 8rem).
- Vary border-radius — tight on inner elements (4-6px), softer on containers (12px).
- Pin CTAs to bottom of cards so they horizontally align across rows.

INTERACTIVITY:
- All buttons need hover state (background shift, scale 1.02) AND active state (scale 0.98).
- Transitions 200-300ms. Use transform + opacity only (never animate width/height/top/left).
- Visible focus rings.
- scroll-behavior: smooth on html.
- NEVER href="#". Every CTA links to a real anchor or mailto:.
- Active nav link styled differently.

CONTENT:
- BANNED phrases: Elevate, Seamless, Unleash, Next-Gen, Game-changer, Delve, Tapestry, "In the world of...", "Take it to the next level", "Empower".
- BANNED names: John Doe, Jane Smith. Use diverse realistic names: Aiyana Reyes, Tomás Okonkwo, Yuki Brennan, Margot Bell, Devon Kapoor.
- BANNED metrics: 99.99%, 50%, $100.00, "10,000+ users", "5 stars". Use organic odd numbers: 47.2%, $89/mo, 8,247 teams, 4.7/5 from 312 reviews.
- BANNED companies: Acme, Nexus, SmartFlow, TechCo. Invent contextual names: Heron, Northwind, Margot & Co, Rowhouse.
- Confident success messages — no exclamation marks. No "Oops!" errors.
- Active voice. Sentence case headers. Never Lorem Ipsum.

COMPONENT PATTERNS — BANNED:
- 3-card carousel testimonial with dots → use a single rotating quote or a masonry wall.
- Accordion FAQ → use a 2-column hairline-separated list.
- Pill "New" / "Beta" badges → use square tags or plain text labels.
- Avatar circles only → mix in squircles.
- Sun/moon dark-mode toggle → use a small dropdown or a text link.
- 4-column footer link farm → keep it to 2 columns max.
- Lucide rocket icon for "Launch" or shield for "Security" → use less obvious metaphors or no icon.

OUTPUT-SKILL:
- Deliver a complete, single self-contained HTML document. No "// rest of code", no "TODO", no skeletal placeholders. Every section must be fully written.
`;

const MANIFEST_DIRECTIVE = `
NAVIGATION INTEGRITY (CRITICAL — anchor links MUST work).
1. BEFORE writing the body, list your sections in an HTML comment at the top: <!-- SECTIONS: hero, work, process, pricing, faq, contact -->
2. Use the EXACT SAME ids as <section id="..."> in the body.
3. Every <nav> link href="#xxx" must match a real <section id="xxx">. No exceptions.
4. Add this script at the end of <body> so anchor links smooth-scroll INSIDE the iframe sandbox (the global CSS scroll-behavior:smooth alone doesn't always trigger inside srcdoc):
<script>
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', '#' + id); }
});
</script>
5. ids are lowercase-kebab-case, unique, descriptive (work / case-studies / pricing — not section-1).
6. Include scroll-margin-top: 5rem on every section so anchors land below the sticky nav.
`;

const FUNCTIONAL_FORMS_DIRECTIVE = `
FUNCTIONAL FORMS — must actually submit, not just look pretty.
- Contact forms: <form action="https://formspree.io/f/xpzgwqkv" method="POST"> with proper name attributes (name, email, message) and <input type="hidden" name="_subject" value="...">.
- Email-capture forms: same Formspree action OR mailto: fallback.
- Intercept submit with JS: fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }), then swap the form for an inline "Thanks — we'll be in touch within 24 hours." panel. No alerts.
- All CTA buttons MUST have href to a real anchor (#contact, #pricing) or mailto:hello@example.com — never href="#" or empty.
- "Download Resume" → link to mailto:?subject=Resume request as fallback.
`;

function buildSystemPrompt(opts: {
  animationIntensity: number; layoutComplexity: number; modernLevel: number;
  pageGoal: string; emotionalTones: string[];
  experimentalMode: boolean; productionMode: boolean;
}) {
  const experimentalBlock = opts.experimentalMode
    ? `\n\nEXPERIMENTAL MODE — Push harder: brutalist accents (raw 1px borders, hard contrasts), oversized lowercase serif display (clamp 4rem to 9rem), kinetic typography, clip-path section dividers, mixed-axis layouts. Still respect the BANNED patterns above.`
    : "";
  const productionBlock = opts.productionMode
    ? `\n\nPRODUCTION MODE — Production-ready: full <head> meta (charset, viewport, description, keywords, author, theme-color), OpenGraph + Twitter Card tags, JSON-LD structured data (Organization or Person), aria-labels on all interactive elements, semantic HTML5 (header/nav/main/section/article/footer), WCAG AA contrast, alt text on all visuals, loading="lazy" below-fold, preconnect to font CDN.`
    : "";

  return `You are an art director and conversion copywriter. You output ONLY raw HTML — no markdown fences, no commentary, no explanations.

${TASTE_DIRECTIVE}

${MANIFEST_DIRECTIVE}

${FUNCTIONAL_FORMS_DIRECTIVE}

COPYWRITING:
- Benefit-driven headlines, 5–9 words, sentence case.
- Specific metrics with odd numbers ("99.94% uptime", "8,247 teams").
- Named testimonials with role + company. Use diverse realistic names.
- Power verbs: Ship, Compose, Cut, Replace, Unblock — never "Elevate" or "Unleash".
- Before any final output: scan for every banned phrase/name/metric/pattern above. If found, rewrite.

SOCIAL PROOF (include ≥2): logo bar (real-feeling brands), star rating with review count, named testimonial cards, stats counter, case-study mini-cards.

COMPONENT MENU — choose intentionally, vary per generation:
Heroes: full-bleed editorial serif | asymmetric with floating UI | dark with kinetic type | minimal with oversized number | split with inset image
Features: bento grid | alternating image-text zig-zag | numbered editorial list | comparison table | tabbed
Pricing (sell goal): 3-tier with highlighted middle | comparison table | single plan with FAQ
CTA: email capture | full-width banner | sticky | split with benefits

TECHNICAL:
- Self-contained HTML5 document.
- TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Anime.js via CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
- Google Fonts: import a serif display + Geist (or Inter as body fallback).
- html { scroll-behavior: smooth }. section { scroll-margin-top: 5rem }.
- Mobile-first responsive. Use min-h-dvh not min-h-screen.
- Apply user's primary color sparingly — as a single accent, not the dominant color.
- Subtle SVG noise overlay at low opacity.

${animationDirective(opts.animationIntensity)}

${layoutDirective(opts.layoutComplexity)}

${modernDirective(opts.modernLevel)}

${goalDirective(opts.pageGoal)}

${tonesDirective(opts.emotionalTones)}${experimentalBlock}${productionBlock}

FINAL CHECK before output:
1. Every nav anchor matches a real section id.
2. The smooth-scroll script is included.
3. No banned phrases, names, metrics, or component patterns.
4. The contact form has a real Formspree action and JS interception.
5. The HTML is COMPLETE — no placeholders, no "..." stand-ins, no "TODO".`;
}

// Post-process: extract nav anchors and ensure each has a matching section id.
function repairNavManifest(html: string): string {
  try {
    const navMatch = html.match(/<nav[\s\S]*?<\/nav>/i);
    if (!navMatch) return html;
    const navBlock = navMatch[0];
    const anchorRe = /href\s*=\s*["']#([a-zA-Z0-9_-]+)["']/g;
    const anchors = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = anchorRe.exec(navBlock)) !== null) {
      const id = m[1];
      if (id && id !== "" && id !== "top") anchors.add(id);
    }
    const missing: string[] = [];
    anchors.forEach((id) => {
      const re = new RegExp(`id\\s*=\\s*["']${id}["']`, "i");
      if (!re.test(html)) missing.push(id);
    });
    if (missing.length) {
      const stub = missing
        .map(
          (id) =>
            `<section id="${id}" style="scroll-margin-top:5rem" class="py-20 px-6 max-w-6xl mx-auto"><h2 class="text-3xl font-medium mb-4 capitalize">${id.replace(/-/g, " ")}</h2><p class="opacity-70">Section content.</p></section>`,
        )
        .join("\n");
      if (/<\/main>/i.test(html)) html = html.replace(/<\/main>/i, `${stub}\n</main>`);
      else if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${stub}\n</body>`);
      else html = html + stub;
    }

    // Always ensure smooth-scroll JS is present (the AI sometimes forgets).
    const smoothScript = `<script>
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  var id = a.getAttribute('href').slice(1);
  if (!id) return;
  var el = document.getElementById(id);
  if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'','#'+id); }
});
</script>`;
    if (!/scrollIntoView/.test(html)) {
      if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${smoothScript}\n</body>`);
      else html += smoothScript;
    }
    return html;
  } catch {
    return html;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action: string = body.action || "generate";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: Array<{ role: string; content: string }> = [];

    if (action === "refine") {
      const { existingHtml, instruction } = body;
      if (!existingHtml || !instruction) {
        return new Response(JSON.stringify({ error: "existingHtml and instruction required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const refineSystem = `You are a precision web-page editor. Apply ONLY the requested change, preserve everything else, output ONLY the complete updated raw HTML — no markdown fences, no commentary.

Rules:
- Keep all section ids intact unless explicitly asked to rename
- Preserve TailwindCSS + Anime.js CDN imports
- Preserve the smooth-scroll JS handler
- Maintain navigation integrity: every nav href must match an existing section id
- Output the FULL document — no placeholders, no "// rest of code"`;
      messages = [
        { role: "system", content: refineSystem },
        { role: "user", content: `EXISTING HTML:\n\`\`\`html\n${existingHtml}\n\`\`\`\n\nINSTRUCTION: ${instruction}\n\nReturn the complete updated HTML.` },
      ];
    } else {
      const {
        projectType, title, description, style, primaryColor,
        pageGoal = "sell", targetAudience = "",
        emotionalTones = ["trust"], emotionalTone, // back-compat
        animationIntensity = 40, layoutComplexity = 30, modernLevel = 50,
        experimentalMode = false, productionMode = false,
        personalContext = "",
      } = body;

      const tones: string[] = Array.isArray(emotionalTones) && emotionalTones.length
        ? emotionalTones
        : (emotionalTone ? [emotionalTone] : ["trust"]);

      const systemPrompt = buildSystemPrompt({
        animationIntensity, layoutComplexity, modernLevel,
        pageGoal, emotionalTones: tones, experimentalMode, productionMode,
      });

      const audienceNote = targetAudience ? `\n- Target Audience: ${targetAudience}` : "";
      const personalBlock = personalContext
        ? `\n\nUSER-PROVIDED REAL CONTEXT (use this to replace placeholder copy with the user's real names, projects, achievements, links — never invent over what they gave you):\n${personalContext}`
        : "";

      const userPrompt = `Compose a landing page with this brief:
- Project Type: ${projectType}
- Title: ${title}
- Description: ${description || "A modern, professional landing page"}
- Style: ${style}
- Primary Color (single accent): ${primaryColor}
- Page Goal: ${pageGoal}${audienceNote}
- Emotional Tones: ${tones.join(" + ")}
- Animation Level: ${animationIntensity}/100
- Layout Complexity: ${layoutComplexity}/100
- Modern Level: ${modernLevel}/100${experimentalMode ? "\n- EXPERIMENTAL MODE: ON" : ""}${productionMode ? "\n- PRODUCTION MODE: ON" : ""}${personalBlock}

Output ONLY the complete raw HTML document. Verify every banned pattern is absent and every nav anchor resolves before you output.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate landing page" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content ?? "";
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    html = repairNavManifest(html);

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-landing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
