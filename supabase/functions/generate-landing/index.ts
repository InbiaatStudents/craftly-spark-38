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
  if (complexity < 25) return `Use a SIMPLE layout: single-column, centered content, generous whitespace, clear visual hierarchy. Standard section stacking.`;
  if (complexity < 50) return `Use a STRUCTURED layout: 2-3 column grids for features, clean card layouts, alternating left-right sections for variety. Well-organized but conventional.`;
  if (complexity < 75) return `Use an ASYMMETRIC layout: offset grids, overlapping elements with z-index layering, mixed column widths, broken grid sections where text overlaps images slightly. Visual tension with purpose.`;
  return `Use a CREATIVE GRID layout: CSS Grid with named areas, overlapping sections, magazine-style mixed layouts, full-bleed hero with inset content blocks, masonry-like feature grids, diagonal section dividers using clip-path.`;
}

function modernDirective(level: number): string {
  if (level < 25) return `Use a SAFE, timeless design: classic sans-serif typography, standard drop shadows, traditional card designs, conventional button styles. Nothing that will look dated quickly.`;
  if (level < 50) return `Use a MODERN design: rounded corners (12-16px), subtle gradients, soft shadows, clean spacing, contemporary color usage. Current but not bleeding-edge.`;
  if (level < 75) return `Use a TRENDY design: large bold typography (clamp-based fluid type), gradient text, glass/frosted cards (backdrop-blur), pill-shaped buttons, dark mode aesthetics even in light themes, grain texture overlays, mesh gradients.`;
  return `Use a FUTURISTIC design: monospace/display fonts for headers, neon accent colors, dark backgrounds with luminous elements, holographic gradients, cyberpunk-inspired UI elements, animated gradient borders, glow effects on interactive elements, variable font animations.`;
}

function goalDirective(goal: string): string {
  const map: Record<string, string> = {
    "hire": `Optimize for HIRING: Include a prominent "Download Resume" or "Contact Me" CTA. Showcase skills with progress indicators or tech stack icons. Add a timeline of experience. Include testimonials from colleagues/clients. Social links prominent.`,
    "sell": `Optimize for SELLING: Lead with the #1 benefit, not features. Include pricing section with 3 tiers (highlight middle). Social proof with customer logos, star ratings. Multiple CTAs throughout. FAQ section addressing objections.`,
    "collect-emails": `Optimize for EMAIL COLLECTION: Hero CTA is an email input + submit button. Offer a compelling lead magnet. Minimal friction. Trust badges and privacy note. "Join X,000+ subscribers" social proof.`,
    "impress": `Optimize for IMPRESSION: Portfolio showcase with large visuals. Case study highlights with metrics. Awards/recognition section. Premium animations. Stats section.`,
    "inform": `Optimize for INFORMATION: Clear content hierarchy with scannable sections. Feature comparison tables. Detailed "How it Works" section. FAQ accordion.`,
  };
  return map[goal] || map["sell"];
}

function toneDirective(tone: string): string {
  const map: Record<string, string> = {
    "trust": `Convey TRUST: Calm, confident language. Security badges, client logos. Testimonials with real names and photos. Professional, measured copy.`,
    "excitement": `Convey EXCITEMENT: Energetic, dynamic language. Action verbs (Launch, Transform, Ignite). Vibrant colors, bold contrasts.`,
    "authority": `Convey AUTHORITY: Strong, definitive language. Data-driven claims. Industry awards. Dark, sophisticated palette. Premium typography.`,
    "warmth": `Convey WARMTH: Friendly, approachable language. Rounded shapes, warm colors. Community-focused. Human-centered design.`,
    "urgency": `Convey URGENCY: Time-sensitive language. Bold CTAs with contrasting colors. Scarcity indicators. Red/orange accents.`,
  };
  return map[tone] || map["trust"];
}

const TASTE_DIRECTIVE = `
DESIGN TASTE — AGGRESSIVELY BREAK AI DEFAULTS (mandatory):
Standard AI output collapses into clichés. You must avoid ALL of:
- Generic centered dark hero with a single big headline + two buttons (overused)
- Repeated left-text / right-image feature rows
- Generic 3-column "icon + title + paragraph" card spam
- Weak typographic hierarchy (everything similar size)
- Cramped or vague spacing
- Lorem-ipsum-feeling filler copy
- Predictable purple-on-white SaaS look

Instead the output MUST feel:
- PREMIUM and ART-DIRECTED (like a brand, not a template)
- READABLE with strong type hierarchy: a true display scale (clamp() fluid type, hero 5xl–8xl, h2 3xl–5xl, body relaxed leading)
- BREATHABLE: generous section padding (py-24 md:py-32), generous container max-widths, intentional negative space
- STRUCTURED with rhythm: sections feel composed, not stacked
- EDITORIAL touches where appropriate: large numerals, oversized quote marks, mixed alignment, eyebrow labels in uppercase tracking-wider
- ASYMMETRIC at least once: break the grid in one section (offset image, overlapping card, sidebar caption)
- TYPOGRAPHIC variety: pair a strong display feel (e.g. Space Grotesk / Fraunces / Instrument Serif via Google Fonts) with a clean body font (Inter)
- Use real, specific copy with concrete metrics and named testimonials — never "Lorem ipsum"

Aim for the visual quality of an award-winning agency landing page, not a generic template.
`;

const MANIFEST_DIRECTIVE = `
NAVIGATION INTEGRITY (CRITICAL):
Before writing the final HTML, mentally build a SECTION MANIFEST: a list of every section id you will use (e.g. "hero", "features", "pricing", "testimonials", "faq", "contact").
Then guarantee:
- EVERY anchor in <nav> (href="#xxx") matches an existing <section id="xxx"> in the body
- No href points to an id that does not exist
- All ids are lowercase-kebab-case and unique
- The first <section> in main has its id referenced by the "logo"/"home" link if present
Verify this mapping before output. Broken anchors are a hard failure.
`;

const FUNCTIONAL_FORMS_DIRECTIVE = `
FUNCTIONAL FORMS (CRITICAL — forms must actually work):
- Contact forms MUST submit to a real endpoint. Use Formspree's universal demo endpoint:
  <form action="https://formspree.io/f/xpzgwqkv" method="POST">
  with proper name attributes on inputs (name="email", name="name", name="message") and a hidden <input type="hidden" name="_subject" value="New message from <site title>">.
- Email-capture forms can use the same Formspree action, or a mailto: action as fallback.
- Show inline success state via small JS: intercept submit, fetch() to the action with FormData, then swap the form for a "Thanks — we'll be in touch." panel.
- All buttons that look like CTAs must have an href to a real anchor (#contact, #pricing) or to mailto:hello@example.com — never href="#" or empty.
- "Download Resume" buttons should link to "#" replaced with a comment like /* TODO: real resume URL */ but include a working mailto: fallback.
`;

function buildSystemPrompt(opts: {
  animationIntensity: number; layoutComplexity: number; modernLevel: number;
  pageGoal: string; emotionalTone: string;
  experimentalMode: boolean; productionMode: boolean;
}) {
  const experimentalBlock = opts.experimentalMode
    ? `\n\nEXPERIMENTAL MODE ENABLED — Push design boundaries: glassmorphism (backdrop-blur), animated gradient backgrounds, split-screen hero, oversized typography (6xl–9xl), brutalist accents (raw borders, stark contrasts), morphing SVG shapes, grain texture overlays, neon glow, clip-path section dividers.`
    : "";
  const productionBlock = opts.productionMode
    ? `\n\nPRODUCTION MODE ENABLED — Output must be production-ready: full <head> meta (charset, viewport, description, keywords, author), OpenGraph + Twitter Card tags, JSON-LD structured data (Organization or Person), aria-labels on all interactive elements, semantic HTML, WCAG AA contrast, alt text on all visuals, loading="lazy" below-fold, preconnect to CDN origins, /.well-known/ai-plugin.json mention in a comment.`
    : "";

  return `You are an elite web designer and conversion copywriter. You output ONLY raw HTML — no markdown fences, no commentary.

${TASTE_DIRECTIVE}

${MANIFEST_DIRECTIVE}

${FUNCTIONAL_FORMS_DIRECTIVE}

COPYWRITING:
- BENEFIT-DRIVEN headlines (6–10 words, punchy)
- Realistic, specific metrics ("99.9% uptime", "10,000+ teams")
- Named testimonials (real-sounding names, roles, companies)
- Power verbs: Transform, Unlock, Ship, Accelerate

SOCIAL PROOF (include ≥2 patterns): logo bar, star ratings + review count, metric badges, testimonial cards with avatar/name/role, "as seen in" media logos.

COMPONENT MENU — pick variants intentionally (don't always pick #1):
Heroes: split with image | full-bleed editorial | asymmetric with floating UI | dark with kinetic type | minimal with oversized number
Features: bento grid | alternating image-text | tabbed | comparison table | numbered editorial list
Social Proof: logo bar | testimonial grid | stats counter | case study cards
Pricing (if sell): 3-tier with highlighted middle | comparison table | single plan
CTA: email capture | full-width gradient banner | sticky | split with benefits

TECHNICAL:
- Self-contained HTML5
- TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Anime.js via CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
- Google Fonts (Inter + one display font)
- Mobile-first responsive
- Apply user's primary color across backgrounds, accents, gradients
- Subtle shadows, intentional radii

${animationDirective(opts.animationIntensity)}

${layoutDirective(opts.layoutComplexity)}

${modernDirective(opts.modernLevel)}

${goalDirective(opts.pageGoal)}

${toneDirective(opts.emotionalTone)}${experimentalBlock}${productionBlock}`;
}

// Post-process: extract nav anchors and ensure each has a matching section id.
// If missing, append placeholder sections so links never 404 in-page.
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
    if (!missing.length) return html;
    const stub = missing
      .map(
        (id) =>
          `<section id="${id}" class="py-20 px-6 max-w-6xl mx-auto"><h2 class="text-3xl font-bold mb-4 capitalize">${id.replace(/-/g, " ")}</h2><p class="text-muted-foreground">Section content.</p></section>`
      )
      .join("\n");
    if (/<\/main>/i.test(html)) return html.replace(/<\/main>/i, `${stub}\n</main>`);
    if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${stub}\n</body>`);
    return html + stub;
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
      // Multi-turn refinement: hot-patch existing HTML
      const { existingHtml, instruction } = body;
      if (!existingHtml || !instruction) {
        return new Response(JSON.stringify({ error: "existingHtml and instruction required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const refineSystem = `You are a precision web-page editor. The user will give you an existing HTML document and a refinement instruction. Apply ONLY the requested change while preserving everything else. Output ONLY the complete, updated raw HTML — no markdown fences, no commentary.

Rules:
- Keep all existing section ids intact unless explicitly asked to rename
- Keep the same component structure unless asked to change it
- Preserve TailwindCSS + Anime.js CDN imports
- Maintain navigation integrity: every nav href must match an existing section id`;
      messages = [
        { role: "system", content: refineSystem },
        { role: "user", content: `EXISTING HTML:\n\`\`\`html\n${existingHtml}\n\`\`\`\n\nINSTRUCTION: ${instruction}\n\nReturn the complete updated HTML.` },
      ];
    } else {
      // Generate
      const {
        projectType, title, description, style, primaryColor,
        pageGoal = "sell", targetAudience = "", emotionalTone = "trust",
        animationIntensity = 40, layoutComplexity = 30, modernLevel = 50,
        experimentalMode = false, productionMode = false,
        personalContext = "", // optional onboarding extra
      } = body;

      const systemPrompt = buildSystemPrompt({
        animationIntensity, layoutComplexity, modernLevel,
        pageGoal, emotionalTone, experimentalMode, productionMode,
      });

      const audienceNote = targetAudience ? `\n- Target Audience: ${targetAudience}` : "";
      const personalBlock = personalContext
        ? `\n\nUSER-PROVIDED REAL CONTEXT (use this to replace placeholder copy with real, personal details — names, projects, achievements, links):\n${personalContext}`
        : "";

      const userPrompt = `Create a landing page with these specifications:
- Project Type: ${projectType}
- Title: ${title}
- Description: ${description || "A modern, professional landing page"}
- Style: ${style}
- Primary Color: ${primaryColor}
- Page Goal: ${pageGoal}${audienceNote}
- Emotional Tone: ${emotionalTone}
- Animation Level: ${animationIntensity}/100
- Layout Complexity: ${layoutComplexity}/100
- Modern Level: ${modernLevel}/100${experimentalMode ? "\n- EXPERIMENTAL MODE: ON" : ""}${productionMode ? "\n- PRODUCTION MODE: ON" : ""}${personalBlock}

Generate a complete, beautiful, conversion-optimized landing page. Output ONLY the raw HTML.`;

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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
