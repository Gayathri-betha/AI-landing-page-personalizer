import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchPageContent(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!resp.ok) throw new Error(`Failed to fetch page: ${resp.status}`);
    const html = await resp.text();
    // Truncate to ~30k chars to fit in context
    return html.slice(0, 30000);
  } catch (e) {
    throw new Error(`Could not fetch landing page: ${(e as Error).message}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adCreative, landingPageUrl } = await req.json();

    if (!adCreative || !landingPageUrl) {
      return new Response(
        JSON.stringify({ error: "Both ad creative and landing page URL are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch the landing page
    const pageHtml = await fetchPageContent(landingPageUrl);

    // Build the prompt
    const adDescription =
      adCreative.type === "url"
        ? `Ad creative URL: ${adCreative.value}`
        : `Ad creative is an uploaded image (base64 encoded).`;

    const messages: any[] = [
      {
        role: "system",
        content: `You are an expert CRO (Conversion Rate Optimization) specialist and web developer. Your task is to take an existing landing page HTML and personalize it based on an ad creative to improve conversion rates.

CRITICAL RULES:
1. PRESERVE the original page structure, layout, and design as much as possible. This is NOT a complete redesign.
2. Only modify elements that improve ad-to-page message match and conversion:
   - Hero headline & subheadline: Align with ad messaging/offer
   - CTA buttons: Match the ad's call-to-action language
   - Above-the-fold content: Reinforce the ad's value proposition
   - Social proof/urgency: Add or enhance if the ad implies it
   - Color accents on CTAs: Can adjust to match ad brand colors
3. DO NOT:
   - Remove existing sections or content
   - Change the navigation or footer
   - Add random new sections
   - Break the existing CSS/layout
   - Remove any tracking scripts or forms
4. Keep all existing external CSS/JS references intact
5. If the page uses external stylesheets, include inline style overrides rather than removing them
6. Add a small, subtle banner or badge at the top saying "✨ Personalized for you" with inline styles

OUTPUT: Return ONLY the complete, valid HTML document. No explanations, no markdown, just the HTML.`,
      },
    ];

    // If it's an image, send as multimodal
    if (adCreative.type === "image" && adCreative.value.startsWith("data:")) {
      const base64Match = adCreative.value.match(/^data:([^;]+);base64,(.+)$/);
      if (base64Match) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: adCreative.value },
            },
            {
              type: "text",
              text: `Here is the ad creative image above. And here is the existing landing page HTML to personalize:\n\n${pageHtml}\n\nPlease analyze the ad creative (its messaging, offer, tone, colors, CTA) and personalize the landing page HTML to better match the ad. Remember: enhance the existing page, don't rebuild it. Output ONLY the modified HTML.`,
            },
          ],
        });
      }
    } else {
      messages.push({
        role: "user",
        content: `${adDescription}\n\nHere is the existing landing page HTML to personalize:\n\n${pageHtml}\n\nPlease analyze the ad creative (its messaging, offer, tone, colors, CTA) and personalize the landing page HTML to better match the ad. Remember: enhance the existing page, don't rebuild it. Output ONLY the modified HTML.`,
      });
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errorText);
      throw new Error("AI generation failed");
    }

    const result = await aiResponse.json();
    let html = result.choices?.[0]?.message?.content || "";

    // Clean up markdown fences if present
    html = html.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "").trim();

    return new Response(JSON.stringify({ html }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("personalize-page error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
