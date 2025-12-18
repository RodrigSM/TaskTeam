import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const gmailUser = Deno.env.get('GMAIL_USER') || 'taskteamoficial@gmail.com'
const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD')!
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'taskteamoficial@gmail.com'

const supabase = createClient(supabaseUrl, supabaseKey)

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

async function sendEmailWithGmail(to: string, subject: string, htmlContent: string) {
  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailPassword,
      },
    },
  });

  await client.send({
    from: `TaskTeam <${gmailUser}>`,
    to: to,
    subject: subject,
    content: "auto",
    html: htmlContent,
  });

  await client.close();
}

function getAdminNotificationHTML(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 800;">
          <span style="color: #ffffff;">Task</span><span style="color: #FF3333;">Team</span>
        </h1>
        
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0"
          style="background-color: #111111; border: 1px solid #333333; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: left;">
              <div style="font-size: 48px; text-align: center; margin-bottom: 20px;">📬</div>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #ffffff; text-align: center;">Nova Mensagem de Contacto</h2>
              
              <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Nome:</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff; font-weight: 600;">${data.name}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Email:</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #FF3333;">${data.email}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Assunto:</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff;">${data.subject}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Mensagem:</p>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #ffffff;">${data.message}</p>
              </div>
              
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #666666; text-align: center;">
                Recebido em ${new Date().toLocaleString('pt-PT')}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function getConfirmationEmailHTML(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 800;">
          <span style="color: #ffffff;">Task</span><span style="color: #FF3333;">Team</span>
        </h1>
        
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0"
          style="background-color: #111111; border: 1px solid #333333; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #ffffff;">Mensagem Recebida!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #aaaaaa;">
                Olá ${name}! Obrigado por entrares em contacto connosco.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #aaaaaa;">
                Recebemos a tua mensagem e vamos responder-te o mais brevemente possível.
              </p>
              <p style="margin: 0; font-size: 14px; color: #666666;">
                A equipa TaskTeam agradece o teu contacto.
              </p>
            </td>
          </tr>
        </table>
        
        <p style="margin-top: 20px; font-size: 12px; color: #444444;">
          © 2025 TaskTeam. Todos os direitos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const data: ContactFormData = await req.json()

    console.log('Contact form submission received:', { name: data.name, email: data.email })

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Send notification to admin
    await sendEmailWithGmail(
      adminEmail,
      `[TaskTeam] Nova mensagem de ${data.name}`,
      getAdminNotificationHTML(data)
    )
    console.log('Admin notification sent successfully')

    // Send confirmation to user
    await sendEmailWithGmail(
      data.email,
      'TaskTeam - Mensagem Recebida',
      getConfirmationEmailHTML(data.name)
    )
    console.log('Confirmation email sent successfully')

    // Store in database (optional)
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([{
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        created_at: new Date().toISOString()
      }])

    if (dbError) {
      console.error('Failed to store in database:', dbError)
      // Don't fail the request if DB insert fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mensagem enviada com sucesso!'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    return new Response(
      JSON.stringify({
        error: 'Erro ao enviar mensagem. Por favor, tenta novamente.'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
