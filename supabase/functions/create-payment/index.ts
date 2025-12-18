import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const EUPAGO_API_KEY = Deno.env.get('EUPAGO_API_KEY') || 'ecb2-d95f-89fa-ba34-b844'
const EUPAGO_API_URL = 'https://clientes.eupago.pt/api/v1.02'

interface PaymentRequest {
  cart: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  total: number
  method: 'mb' | 'mbw' // mb = Multibanco, mbw = MB WAY
  phone?: string // Obrigatório para MB WAY
  customer_email: string
  customer_name: string
  shipping_info: any
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cart, total, method, phone, customer_email, customer_name, shipping_info }: PaymentRequest = await req.json()

    console.log('Payment request received:', { method, total, customer_email })

    // Validar dados
    if (!total || total <= 0) {
      return new Response(
        JSON.stringify({ error: 'Valor inválido' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (method === 'mbw' && !phone) {
      return new Response(
        JSON.stringify({ error: 'Telefone obrigatório para MB WAY' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Chamar API Eupago
    const endpoint = method === 'mb' ? '/multibanco' : '/mbway'
    
    console.log('Calling Eupago API:', `${EUPAGO_API_URL}${endpoint}`)

    const response = await fetch(`${EUPAGO_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${EUPAGO_API_KEY}`
      },
      body: JSON.stringify({
        payment: {
          amount: {
            value: total.toFixed(2),
            currency: 'EUR'
          },
          customer: {
            email: customer_email,
            name: customer_name,
            ...(method === 'mbw' && { phone: phone })
          },
          metadata: {
            cart_items: cart.length,
            shipping_city: shipping_info?.city || 'N/A'
          }
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Eupago API error:', data)
      throw new Error(data.message || 'Erro ao processar pagamento')
    }

    console.log('Eupago response:', data)

    // Retornar referência/ID do pagamento
    return new Response(
      JSON.stringify({
        success: true,
        method: method,
        ...(method === 'mb' && {
          entidade: data.entidade,
          referencia: data.referencia,
          valor: data.valor
        }),
        ...(method === 'mbw' && {
          transaction_id: data.transaction_id,
          status: data.status
        })
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
