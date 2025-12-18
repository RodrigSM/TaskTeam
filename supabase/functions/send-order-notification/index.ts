import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')!
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'taskteamoficial@gmail.com'
const senderEmail = Deno.env.get('SENDER_EMAIL') || 'taskteamoficial@gmail.com'

const supabase = createClient(supabaseUrl, supabaseKey)

interface OrderNotificationData {
    orderId: string
    customerEmail: string
    customerName: string
    items: Array<{
        name: string
        quantity: number
        price: number
    }>
    totalAmount: number
    shippingAddress?: string
    paymentMethod: string
    referencia?: string
}

async function sendEmailWithSendGrid(to: string, subject: string, htmlContent: string) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: senderEmail, name: 'TaskTeam' },
            subject: subject,
            content: [{ type: 'text/html', value: htmlContent }],
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid error: ${error}`)
    }

    return response
}

function getCustomerOrderEmailHTML(data: OrderNotificationData): string {
    const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #333333; color: #ffffff;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333333; text-align: center; color: #aaaaaa;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333333; text-align: right; color: #ffffff;">€${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

    const paymentInstructions = data.paymentMethod === 'multibanco' && data.referencia ? `
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF3333;">
      <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #FF3333;">Detalhes de Pagamento Multibanco</h3>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888888;">Entidade:</p>
      <p style="margin: 0 0 16px 0; font-size: 20px; color: #ffffff; font-weight: bold;">11202</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888888;">Referência:</p>
      <p style="margin: 0 0 16px 0; font-size: 20px; color: #ffffff; font-weight: bold;">${data.referencia}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888888;">Montante:</p>
      <p style="margin: 0; font-size: 20px; color: #FF3333; font-weight: bold;">€${data.totalAmount.toFixed(2)}</p>
    </div>
  ` : `
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px; color: #aaaaaa;">
        Método de pagamento: <strong style="color: #ffffff;">MB WAY</strong>
      </p>
      <p style="margin: 12px 0 0 0; font-size: 14px; color: #888888;">
        Receberás uma notificação no teu telemóvel para confirmar o pagamento.
      </p>
    </div>
  `

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
            <td style="padding: 40px;">
              <div style="font-size: 48px; text-align: center; margin-bottom: 20px;">🎉</div>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #ffffff; text-align: center;">Pedido Confirmado!</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #aaaaaa; text-align: center;">
                Olá ${data.customerName}! O teu pedido foi recebido com sucesso.
              </p>
              
              <div style="background-color: #0a0a0a; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #888888;">Número do Pedido:</p>
                <p style="margin: 8px 0 0 0; font-size: 18px; color: #FF3333; font-weight: bold;">#${data.orderId}</p>
              </div>
              
              <h3 style="margin: 24px 0 16px 0; font-size: 18px; color: #ffffff;">Resumo do Pedido</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #333333;">
                <thead>
                  <tr>
                    <th style="padding: 12px; border-bottom: 2px solid #FF3333; text-align: left; color: #aaaaaa; font-size: 12px; text-transform: uppercase;">Produto</th>
                    <th style="padding: 12px; border-bottom: 2px solid #FF3333; text-align: center; color: #aaaaaa; font-size: 12px; text-transform: uppercase;">Qtd</th>
                    <th style="padding: 12px; border-bottom: 2px solid #FF3333; text-align: right; color: #aaaaaa; font-size: 12px; text-transform: uppercase;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 16px 12px 0 12px; text-align: right; font-size: 18px; font-weight: bold; color: #ffffff;">Total:</td>
                    <td style="padding: 16px 12px 0 12px; text-align: right; font-size: 18px; font-weight: bold; color: #FF3333;">€${data.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              ${paymentInstructions}
              
              <p style="margin: 24px 0 0 0; font-size: 14px; color: #666666; text-align: center;">
                Receberás uma confirmação assim que o pagamento for processado.
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

function getAdminOrderNotificationHTML(data: OrderNotificationData): string {
    const itemsHTML = data.items.map(item => `
    <li style="margin-bottom: 8px; color: #ffffff;">
      ${item.quantity}x ${item.name} - €${item.price.toFixed(2)}
    </li>
  `).join('')

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
              <div style="font-size: 48px; text-align: center; margin-bottom: 20px;">🛍️</div>
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #ffffff; text-align: center;">Novo Pedido Recebido!</h2>
              
              <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Pedido nº:</p>
                <p style="margin: 0 0 20px 0; font-size: 18px; color: #FF3333; font-weight: bold;">#${data.orderId}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Cliente:</p>
                <p style="margin: 0 0 8px 0; font-size: 16px; color: #ffffff; font-weight: 600;">${data.customerName}</p>
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #aaaaaa;">${data.customerEmail}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Produtos:</p>
                <ul style="margin: 0 0 20px 0; padding-left: 20px; list-style: none;">
                  ${itemsHTML}
                </ul>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Total:</p>
                <p style="margin: 0 0 20px 0; font-size: 20px; color: #FF3333; font-weight: bold;">€${data.totalAmount.toFixed(2)}</p>
                
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Método de Pagamento:</p>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff;">${data.paymentMethod === 'multibanco' ? 'Multibanco' : 'MB WAY'}</p>
                
                ${data.shippingAddress ? `
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: #888888;">Morada de Envio:</p>
                  <p style="margin: 0; font-size: 14px; color: #aaaaaa; line-height: 1.6;">${data.shippingAddress}</p>
                ` : ''}
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
        const data: OrderNotificationData = await req.json()

        console.log('Order notification request received:', { orderId: data.orderId })

        // Validate required fields
        if (!data.orderId || !data.customerEmail || !data.items || data.items.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Dados do pedido incompletos' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        // Send order confirmation to customer
        await sendEmailWithSendGrid(
            data.customerEmail,
            `TaskTeam - Pedido #${data.orderId} Confirmado`,
            getCustomerOrderEmailHTML(data)
        )
        console.log('Customer confirmation email sent')

        // Send notification to admin
        await sendEmailWithSendGrid(
            adminEmail,
            `[TaskTeam] Novo Pedido #${data.orderId}`,
            getAdminOrderNotificationHTML(data)
        )
        console.log('Admin notification sent')

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Notificações enviadas com sucesso!'
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
        console.error('Error sending order notifications:', error)
        return new Response(
            JSON.stringify({
                error: 'Erro ao enviar notificações',
                details: error.message
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
