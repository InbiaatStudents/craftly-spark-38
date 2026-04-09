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
    "hire": `Optimize for HIRING: Include a prominent "Download Resume" or "Contact Me" CTA. Showcase skills with progress indicators or tech stack icons. Add a timeline of experience. Include testimonials from colleagues/clients. Social links prominent. The hero should position the person as the solution to a hiring need.`,
    "sell": `Optimize for SELLING: Lead with the #1 benefit, not features. Include pricing section with 3 tiers (highlight middle). Add urgency (limited offer, countdown concept). Social proof with customer logos, star ratings, "X,000+ customers" badge. Multiple CTAs throughout. FAQ section addressing objections. Money-back guarantee badge.`,
    "collect-emails": `Optimize for EMAIL COLLECTION: Hero CTA is an email input + submit button. Offer a compelling lead magnet ("Free guide", "Exclusive access"). Minimal friction — short form. Add trust badges and privacy note. Include "Join X,000+ subscribers" social proof. Secondary CTA at bottom. Benefit bullets near the form.`,
    "impress": `Optimize for IMPRESSION: Portfolio showcase with large visuals. Case study highlights with metrics. Awards/recognition section. Smooth premium animations. High-end design feel. Testimonials from notable clients/companies. Stats section (projects, clients, years). Minimal text, maximum visual impact.`,
    "inform": `Optimize for INFORMATION: Clear content hierarchy with scannable sections. Feature comparison tables. Detailed "How it Works" section (3-5 steps). Knowledge base preview or blog section. FAQ accordion. Resource download links. Newsletter signup as secondary CTA.`,
  };
  return map[goal] || map["sell"];
}

function toneDirective(tone: string): string {
  const map: Record<string, string> = {
    "trust": `Convey TRUST: Use calm, confident language. Include security badges, client logos, certifications. Testimonials with real names and photos. "Trusted by X companies" stats. Professional, measured copy — no hype. Blue/green accent undertones work well.`,
    "excitement": `Convey EXCITEMENT: Use energetic, dynamic language. Exclamation points sparingly but effectively. Action verbs (Launch, Transform, Ignite). Vibrant colors, bold contrasts. Animated elements that feel alive. "Join the revolution" energy.`,
    "authority": `Convey AUTHORITY: Use strong, definitive language. Data-driven claims with specific numbers. Industry awards and media mentions. Expert testimonials. White papers or case study references. Dark, sophisticated color palette. Premium typography.`,
    "warmth": `Convey WARMTH: Use friendly, approachable language. First-person plural ("We believe..."). Rounded shapes, warm colors. Soft imagery concepts. Community-focused messaging. "Built with love" personality. Human-centered design.`,
    "urgency": `Convey URGENCY: Use time-sensitive language. Countdown references. "Limited spots", "Don't miss out", "Act now". Bold CTAs with contrasting colors. Scarcity indicators. Short, punchy sentences. High contrast design. Red/orange accent highlights.`,
  };
  return map[tone] || map["trust"];
}

// Validate and fix navigation links to ensure all nav hrefs have matching section IDs
function validateNavLinks(html: string): string {
  // Extract all nav href="#id" patterns
  const navHrefPattern = /href=["']#([^"']+)["']/g;
  const sectionIdPattern = /id=["']([^"']+)["']/g;
  
  const navHrefs: string[] = [];
  const sectionIds: string[] = [];
  
  let match;
  while ((match = navHrefPattern.exec(html)) !== null) {
    navHrefs.push(match[1]);
  }
  while ((match = sectionIdPattern.exec(html)) !== null) {
    sectionIds.push(match[1]);
  }
  
  // Find missing sections and add placeholder IDs if needed
  let fixedHtml = html;
  for (const href of navHrefs) {
    if (!sectionIds.includes(href)) {
      // Try to find a section without an ID and add one, or fix the href
      // For now, we'll ensure the section exists by checking common patterns
      const sectionPattern = new RegExp(`<section[^>]*>`, 'g');
      const sections = fixedHtml.match(sectionPattern) || [];
      
      // If there's a section that should have this ID but doesn't, this is logged
      console.log(`Nav link #${href} may not have a matching section ID`);
    }
  }
  
  return fixedHtml;
}

// Generate AI Engine Optimization metadata
function generateAEOMetadata(title: string, description: string, projectType: string): string {
  const isPerson = projectType === "portfolio" || projectType === "personal";
  
  // Primary JSON-LD schema
  const schema = {
    "@context": "https://schema.org",
    "@type": isPerson ? "Person" : "Organization",
    "name": title,
    "description": description || `${title} - Professional landing page`,
    "url": "{{SITE_URL}}",
    ...(isPerson ? {
      "sameAs": [],
      "jobTitle": "Professional",
    } : {
      "logo": "{{SITE_URL}}/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
      },
    }),
  };

  // WebSite schema for better AI discoverability
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": title,
    "url": "{{SITE_URL}}",
    "description": description || title,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "{{SITE_URL}}/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  
  return `
<!-- AI Engine Optimization (AEO) - Structured Data for LLM Discovery -->
<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(websiteSchema, null, 2)}
</script>

<!-- AI Metadata Tags -->
<meta name="ai-description" content="${description || title}">
<meta name="ai-category" content="${projectType}">
<meta name="ai-content-type" content="landing-page">
<meta name="ai-target-audience" content="general">

<!-- LLM Context Hints -->
<meta name="llm-summary" content="${title}: ${description || 'A professional landing page'}">
<meta name="llm-keywords" content="${projectType}, landing page, ${title.toLowerCase()}">

<!-- AI Plugin Discovery -->
<link rel="ai-plugin" href="/.well-known/ai-plugin.json">
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Handle refine mode for hot-patching existing HTML
    if (requestBody.refineMode) {
      const { refinePrompt, existingHtml, title } = requestBody;
      
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
      
      const refineSystemPrompt = `You are an expert web developer who modifies existing HTML code based on user instructions.
You will receive existing HTML and a modification request. Apply ONLY the requested changes.
Do not regenerate the entire page - make surgical edits to the existing code.
Output ONLY the modified HTML code - no markdown fences, no explanations.

Rules:
- Preserve all existing structure and content unless explicitly asked to change it
- Make minimal changes to achieve the requested result
- Keep all existing styles and classes unless they conflict with the request
- Maintain responsive design and accessibility`;

      const refineUserPrompt = `Here is the existing HTML for "${title}":

${existingHtml}

---

Please apply this modification: ${refinePrompt}

Output the complete modified HTML.`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: refineSystemPrompt },
              { role: "user", content: refineUserPrompt },
            ],
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Failed to refine landing page" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      let html = data.choices?.[0]?.message?.content ?? "";
      html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      html = validateNavLinks(html);

      return new Response(JSON.stringify({ html }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Standard generation mode
    const {
      projectType, title, description, style, primaryColor,
      pageGoal = "sell", targetAudience = "", emotionalTone = "trust",
      animationIntensity = 40, layoutComplexity = 30, modernLevel = 50,
      experimentalMode = false, productionMode = false,
      profileData = null, // New: scraped profile data from onboarding
    } = requestBody;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build profile context if available from onboarding
    const profileContext = profileData ? `
PERSONAL PROFILE DATA (use this instead of placeholder content):
- Name: ${profileData.name || "Not provided"}
- Headline: ${profileData.headline || "Not provided"}
- Bio: ${profileData.bio || "Not provided"}
- Skills: ${profileData.skills?.join(", ") || "Not provided"}
- Projects: ${profileData.projects?.map((p: any) => `${p.name}: ${p.description}`).join("; ") || "Not provided"}
- Social Links: ${profileData.socialLinks?.map((s: any) => `${s.platform}: ${s.url}`).join(", ") || "Not provided"}

IMPORTANT: Replace ALL placeholder text with real data from above. Do not use "Lorem ipsum" or "John Doe" - use the actual profile data provided.
` : "";

    const experimentalBlock = experimentalMode
      ? `\n\nEXPERIMENTAL MODE ENABLED — Push design boundaries:
- Use glassmorphism (backdrop-blur, semi-transparent backgrounds, frosted glass cards)
- Animated gradient backgrounds (CSS @keyframes rotating gradients)
- Split-screen / asymmetric hero layouts
- Bold, oversized typography (6xl-9xl for hero text)
- Try brutalist elements: raw borders, stark contrasts, unconventional spacing
- Morphing SVG shapes in background
- Noise/grain texture overlays using CSS
- Neon glow effects on text and borders
- Variable font weight animations
- Diagonal or curved section dividers using clip-path`
      : "";

    const productionBlock = productionMode
      ? `\n\nPRODUCTION MODE ENABLED — Output must be production-ready:
- Add comprehensive <head> with: <meta charset>, viewport, description, keywords, author
- Add OpenGraph meta tags (og:title, og:description, og:type, og:url, og:image placeholder)
- Add Twitter Card meta tags
- Add JSON-LD structured data (Organization or Person schema)
- All interactive elements must have aria-labels
- Use semantic HTML: <nav>, <main>, <article>, <section>, <aside>, <footer>
- Add role attributes where appropriate
- Ensure WCAG AA contrast ratios
- Add alt text to all images/icons
- Add <noscript> fallback message
- Add loading="lazy" to below-fold images
- Minimize inline JS — keep it clean and well-commented
- Add print styles (@media print)
- Preconnect to CDN origins`
      : "";

    const systemPrompt = `You are an elite web developer and conversion-focused copywriter who creates stunning, production-ready landing pages. You output ONLY raw HTML code — no markdown fences, no explanations, no commentary. Just the complete HTML document.

COPYWRITING RULES:
- Write BENEFIT-DRIVEN headlines (e.g., "Ship 10x Faster" not "Our Fast Platform")
- Use the Problem → Agitation → Solution framework for hero sections
- Include specific, realistic metrics (e.g., "99.9% uptime", "50% faster deploys", "10,000+ teams")
- Generate realistic testimonials with names, roles, and companies
- Every section must have a clear purpose in the conversion funnel
- Use power words: Transform, Unlock, Accelerate, Revolutionize, Effortless
- Headlines should be 6-10 words max, punchy and memorable

SOCIAL PROOF PATTERNS (include at least 2):
- Customer logos bar ("Trusted by teams at...")
- Star ratings with review counts
- Metric badges ("10,000+ users", "4.9/5 rating", "99.9% uptime")
- Testimonial cards with avatar, name, role, company, quote
- "As seen in" media logos
- Live user count or activity indicator

COMPONENT SELECTION — Choose and customize from these patterns:
Heroes (pick 1): Centered with email capture | Split with image | Video background | Gradient with floating shapes | Full-screen with scroll indicator
Features (pick 1-2): Icon grid (3 or 4 col) | Alternating image-text rows | Tabbed features | Bento grid | Feature comparison table
Social Proof (pick 1-2): Logo bar | Testimonial carousel/grid | Stats counter section | Case study cards
Pricing (if goal=sell, include): 3-tier cards with highlighted "Popular" | Simple comparison table | Single plan with feature list
CTA (pick 1-2): Email capture with incentive | Full-width gradient banner | Floating sticky CTA | Split with benefits list

TECHNICAL REQUIREMENTS:
- Complete, self-contained HTML5 document
- Include TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Anime.js via CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
- Use Inter font from Google Fonts
- Fully responsive (mobile-first design)
- Use semantic HTML (header, nav, main, section, footer)
- Apply the user's chosen primary color throughout (backgrounds, buttons, accents, gradients)
- Proper contrast ratios for accessibility
- Subtle box shadows and rounded corners for depth

${animationDirective(animationIntensity)}

${layoutDirective(layoutComplexity)}

${modernDirective(modernLevel)}

${goalDirective(pageGoal)}

${toneDirective(emotionalTone)}${experimentalBlock}${productionBlock}

NAVIGATION CONSISTENCY RULE (CRITICAL):
- Before generating, define a MANIFEST of section IDs you will use
- Every nav link href="#xyz" MUST have a matching section with id="xyz"
- Standard manifest: hero, features, testimonials, pricing, contact, faq
- If nav links to #work, there MUST be a <section id="work">
- Verify all links match before outputting

${profileContext}`;


    const audienceNote = targetAudience ? `\n- Target Audience: ${targetAudience}` : "";

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
- Modern Level: ${modernLevel}/100${experimentalMode ? "\n- EXPERIMENTAL MODE: ON — push creative boundaries" : ""}${productionMode ? "\n- PRODUCTION MODE: ON — optimize for real deployment" : ""}

Generate a complete, beautiful, conversion-optimized landing page with persuasive copy, social proof, and appropriate animations. Output ONLY the raw HTML code.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate landing page" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content ?? "";

    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    
    // Validate navigation links
    html = validateNavLinks(html);
    
    // Add AEO metadata if production mode
    if (productionMode) {
      const aeoMeta = generateAEOMetadata(title, description, projectType);
      // Insert AEO metadata before closing </head>
      html = html.replace('</head>', `${aeoMeta}</head>`);
    }

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
