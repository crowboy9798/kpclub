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
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
    contentType: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, fromEmail, fromName, attachments }: EmailRequest = await req.json();

    console.log(`Sending emails to ${recipients.length} recipients`);

    const results = [];
    
    // Send emails sequentially with delay to respect rate limits (2 per second for free tier)
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      if (!recipient.email) {
        console.log(`Skipping recipient ${recipient.first_name} ${recipient.last_name} - no email address`);
        results.push({ success: false, error: "No email address" });
        continue;
      }

      try {
        const personalizedMessage = message.replace(/\{first_name\}/g, recipient.first_name)
                                          .replace(/\{last_name\}/g, recipient.last_name)
                                          .replace(/\{full_name\}/g, `${recipient.first_name} ${recipient.last_name}`);

        const emailPayload: any = {
          from: `${fromName} <admin@kensingtonprobusclub.com.au>`,
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
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
          emailPayload.attachments = attachments.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
          }));
        }

        const emailResponse = await resend.emails.send(emailPayload);

        console.log(`Email sent successfully to ${recipient.email}:`, emailResponse);
        results.push({ success: true, id: emailResponse.data?.id });
        
        // Add delay between emails to respect rate limits (500ms = 2 per second)
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        // Handle Resend validation errors specifically
        if (error.message && error.message.includes('testing emails')) {
          results.push({ success: false, error: 'Email restricted - Resend free tier only allows verified addresses' });
        } else {
          results.push({ success: false, error: error.message });
        }
      }
    }
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