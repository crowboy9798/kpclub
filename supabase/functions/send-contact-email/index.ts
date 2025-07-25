import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ 
        error: "Email service not configured" 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { name, email, phone, subject, message }: ContactFormData = await req.json();

    const resend = new Resend(apiKey);
    
    // Send email to the club
    const result = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["kensingtonprobusclub@gmail.com"],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    });

    // Send confirmation email to the sender
    await resend.emails.send({
      from: "Kensington Probus Club <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting us",
      html: `
        <h2>Thank you for your message!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p><em>${subject}</em></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>Kensington Probus Club</p>
        <p>Email: kensingtonprobusclub@gmail.com<br>Phone: 0417803220</p>
      `,
    });

    console.log("Contact form email sent successfully:", result);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Contact form submitted successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error sending contact form email:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to send contact form"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);