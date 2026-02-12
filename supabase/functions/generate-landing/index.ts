import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectType, title, description, style, primaryColor } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert web developer who creates stunning, production-ready landing pages. You output ONLY raw HTML code — no markdown fences, no explanations, no commentary. Just the complete HTML document.

Requirements for every landing page you generate:
- Complete, self-contained HTML5 document
- Include TailwindCSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Include Anime.js via CDN: <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js"></script>
- Use Inter font from Google Fonts
- Fully responsive (mobile-first)
- Use semantic HTML (header, main, section, footer)
- Realistic, professional content — NO lorem ipsum or placeholder text
- Apply the user's chosen primary color throughout (backgrounds, buttons, accents, gradients)
- Modern SaaS design: large hero, clean spacing, gradient backgrounds, card-based sections
- Include Anime.js animations in an inline <script> at the bottom:
  * Hero text fade-in + slide-up
  * Staggered card entrance animations
  * Scroll-reveal effects using IntersectionObserver
  * Floating background shapes (subtle decorative elements)
  * Button hover scale transitions
- Include at least: Hero section, Features/Services section, About/Stats section, CTA section, Footer
- Use proper contrast ratios for accessibility
- Add subtle box shadows and rounded corners for depth`;

    const userPrompt = `Create a landing page with these specifications:
- Project Type: ${projectType}
- Title: ${title}
- Description: ${description}
- Style: ${style}
- Primary Color: ${primaryColor}

Generate a complete, beautiful, animated landing page. Output ONLY the raw HTML code.`;

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

    // Strip markdown fences if the model wraps the output
    html = html.replace(/^```html?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

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
