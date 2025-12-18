import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const payload = await req.json()

    console.log('Webhook received:', payload)

    // Validar webhook signature (importante para segurança)
    const signature = req.headers.get('X-Eupago-Signature')

    // TODO: Validar signature aqui com a tua chave secreta
    // const isValid = validateSignature(payload, signature)
    // if (!isValid) throw new Error('Invalid signature')

    // Processar notificação de pagamento
    if (payload.status === 'success' || payload.status === 'paid') {
      const { referencia, valor } = payload

      console.log('Payment confirmed:', { referencia, valor })

      // Atualizar estado do pedido na base de dados
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('referencia', referencia)

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log('Order updated successfully')

      // Enviar email de confirmação ao cliente
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*')
          .eq('referencia', referencia)
          .single()

        if (orderData) {
          const emailPayload = {
            orderId: referencia,
            customerEmail: payload.customer_email || orderData.shipping_info?.email,
            customerName: payload.customer_name || 'Cliente',
            items: orderData.cart_items || [],
            totalAmount: parseFloat(valor),
            paymentMethod: orderData.payment_method || 'multibanco',
            referencia: referencia
          }

          // Chamar Edge Function de email
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify(emailPayload)
          })

          if (emailResponse.ok) {
            console.log('✅ Payment confirmation emails sent')
          } else {
            console.error('⚠️ Failed to send confirmation emails')
          }
        }
      } catch (emailError) {
        console.error('Email error (non-critical):', emailError)
        // Don't fail webhook if email fails
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment processed' }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received' }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
