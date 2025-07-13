import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  recipients: Array<{
    email: string;
    first_name: string;
    last_name: string;
  }>;
  subject: string;
  message: string;
  fromEmail: string;
  fromName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, fromEmail, fromName }: EmailRequest = await req.json();

    console.log(`Sending emails to ${recipients.length} recipients`);

    const emailPromises = recipients.map(async (recipient) => {
      if (!recipient.email) {
        console.log(`Skipping recipient ${recipient.first_name} ${recipient.last_name} - no email address`);
        return { success: false, error: "No email address" };
      }

      try {
        const personalizedMessage = message.replace(/\{first_name\}/g, recipient.first_name)
                                          .replace(/\{last_name\}/g, recipient.last_name)
                                          .replace(/\{full_name\}/g, `${recipient.first_name} ${recipient.last_name}`);

        const emailResponse = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [recipient.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${recipient.first_name},</h2>
              ${personalizedMessage.split('\n').map(line => `<p>${line}</p>`).join('')}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from KPC Member Management System.
              </p>
            </div>
          `,
        });

        console.log(`Email sent successfully to ${recipient.email}:`, emailResponse);
        return { success: true, id: emailResponse.data?.id };
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        // Handle Resend validation errors specifically
        if (error.message && error.message.includes('testing emails')) {
          return { success: false, error: 'Email restricted - Resend free tier only allows verified addresses' };
        }
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({ 
      message: `Emails sent: ${successful} successful, ${failed} failed`,
      successful,
      failed,
      results 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);