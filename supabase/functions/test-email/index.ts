import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY is:", apiKey ? "SET" : "NOT SET");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "RESEND_API_KEY not configured",
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(apiKey);
    
    // Simple test email
    const result = await resend.emails.send({
      from: "Test <onboarding@resend.dev>",
      to: ["kensingtonprobusclub@gmail.com"],
      subject: "Test from deployed edge function",
      html: `<p>This is a test email sent from the deployed edge function at ${new Date().toISOString()}</p>`,
    });

    console.log("Email test result:", result);

    return new Response(JSON.stringify({ 
      success: true,
      result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email test error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);