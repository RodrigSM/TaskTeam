-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  referencia VARCHAR(20) UNIQUE,
  entidade VARCHAR(10),
  valor DECIMAL(10, 2),
  payment_method VARCHAR(10), -- 'mb' ou 'mbw'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'expired', 'cancelled'
  cart_items JSONB,
  shipping_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_referencia ON orders(referencia);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Política: utilizadores só veem os seus pedidos
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Política: utilizadores só podem inserir os seus pedidos
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE orders IS 'Pedidos de compra dos utilizadores';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pending, paid, expired, cancelled';
COMMENT ON COLUMN orders.payment_method IS 'Método de pagamento: mb (Multibanco) ou mbw (MB WAY)';
