import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobTitle, jobDescription } = await req.json();
    const SEEMODO_API_KEY = Deno.env.get("SEEMODO_API_KEY");
    if (!SEEMODO_API_KEY) throw new Error("SEEMODO_API_KEY is not configured");

    const systemPrompt = `Du bist ein KI-Experte für Arbeitsplatzautomatisierung. Analysiere die gegebene Rolle/Jobbeschreibung und erstelle eine detaillierte KI-Potenzialanalyse.

Antworte NUR mit dem JSON-Tool-Call. Keine zusätzlichen Erklärungen.`;

    const userPrompt = jobDescription
      ? `Analysiere diese Rolle: "${jobTitle}"\n\nJobbeschreibung:\n${jobDescription}`
      : `Analysiere diese Rolle: "${jobTitle}"\n\nErstelle eine realistische Analyse basierend auf typischen Aufgaben dieser Position.`;

    const response = await fetch("https://ai.gateway.seemodo.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SEEMODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "role_analysis",
              description: "Erstelle eine vollständige KI-Potenzialanalyse für eine Rolle",
              parameters: {
                type: "object",
                properties: {
                  ai_coverage_score: {
                    type: "integer",
                    description: "KI-Abdeckungsgrad in Prozent (0-100). Wie viel der Rolle kann durch KI unterstützt werden?"
                  },
                  tasks: {
                    type: "array",
                    description: "Liste aller analysierten Aufgaben mit Automatisierungspotenzial",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name der Aufgabe" },
                        automation_level: { type: "string", enum: ["voll", "teilweise", "unterstützend", "manuell"] },
                        ai_tool: { type: "string", description: "Empfohlenes KI-Tool (z.B. ChatGPT, Copilot, Jasper, etc.)" },
                        time_saved_hours_per_week: { type: "number", description: "Geschätzte Zeitersparnis pro Woche in Stunden" },
                        description: { type: "string", description: "Kurze Beschreibung der Automatisierung" }
                      },
                      required: ["name", "automation_level", "ai_tool", "time_saved_hours_per_week", "description"]
                    }
                  },
                  quick_wins: {
                    type: "array",
                    description: "Top 5 schnell umsetzbare Maßnahmen",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        impact: { type: "string", enum: ["hoch", "mittel", "niedrig"] },
                        effort: { type: "string", enum: ["gering", "mittel", "hoch"] },
                        description: { type: "string" }
                      },
                      required: ["title", "impact", "effort", "description"]
                    }
                  },
                  workflows: {
                    type: "array",
                    description: "Vergleich alter vs. neuer Workflow (2-3 Beispiele)",
                    items: {
                      type: "object",
                      properties: {
                        process_name: { type: "string" },
                        old_steps: { type: "array", items: { type: "string" } },
                        new_steps: { type: "array", items: { type: "string" } },
                        time_reduction_percent: { type: "integer" }
                      },
                      required: ["process_name", "old_steps", "new_steps", "time_reduction_percent"]
                    }
                  },
                  prompts: {
                    type: "array",
                    description: "5 sofort nutzbare KI-Prompts für diese Rolle",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        prompt: { type: "string" },
                        use_case: { type: "string" }
                      },
                      required: ["title", "prompt", "use_case"]
                    }
                  }
                },
                required: ["ai_coverage_score", "tasks", "quick_wins", "workflows", "prompts"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "role_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit erreicht, bitte versuche es später erneut." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Zahlungspflichtig, bitte Guthaben aufladen." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "KI-Analyse fehlgeschlagen" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Unerwartetes KI-Antwortformat" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-role error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
