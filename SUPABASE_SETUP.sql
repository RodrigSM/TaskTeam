-- ===============================================
-- CONFIGURAÇÃO SUPABASE PARA TASKTEAM WEBSITE
-- ===============================================

-- 1. ATIVAR RLS (Row Level Security) na tabela products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICA: Permitir que TODOS vejam os produtos (mesmo sem login)
CREATE POLICY "Produtos são públicos - leitura para todos"
ON products FOR SELECT
TO public
USING (true);

-- 3. CRIAR POLÍTICA: Apenas utilizadores autenticados podem inserir produtos
CREATE POLICY "Apenas autenticados podem inserir produtos"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. CRIAR POLÍTICA: Apenas utilizadores autenticados podem atualizar produtos
CREATE POLICY "Apenas autenticados podem atualizar produtos"
ON products FOR UPDATE
TO authenticated
USING (true);

-- 5. CRIAR POLÍTICA: Apenas utilizadores autenticados podem apagar produtos
CREATE POLICY "Apenas autenticados podem apagar produtos"
ON products FOR DELETE
TO authenticated
USING (true);

-- ===============================================
-- VERIFICAÇÕES
-- ===============================================

-- Verificar se as políticas foram criadas
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Ver todos os produtos
SELECT * FROM products;

-- ===============================================
-- DADOS DE TESTE (se ainda não tiveres produtos)
-- ===============================================

-- Apagar produtos antigos (opcional)
-- DELETE FROM products;

-- Inserir produtos de exemplo
INSERT INTO products (name, price, image_url, description, stock) VALUES
('Camisola TaskTeam Oficial', 29.99, 'https://via.placeholder.com/400x400/ff0000/ffffff?text=Camisola+TaskTeam', 'Camisola oficial da equipa TaskTeam. 100% algodão premium.', 50),
('Boné TaskTeam Gaming', 15.99, 'https://via.placeholder.com/400x400/000000/ff0000?text=Boné+TT', 'Boné bordado com logo oficial. Tamanho ajustável.', 30),
('Mousepad Gaming TT XL', 24.99, 'https://via.placeholder.com/400x400/1a1a1a/ff0000?text=Mousepad+XL', 'Mousepad XL anti-derrapante 900x400mm. Superfície premium para gaming.', 100),
('Caneca TaskTeam', 12.99, 'https://via.placeholder.com/400x400/ffffff/000000?text=Caneca+TT', 'Caneca de cerâmica premium com logo TaskTeam. 350ml.', 25),
('Hoodie TaskTeam Premium', 49.99, 'https://via.placeholder.com/400x400/2d2d2d/ff0000?text=Hoodie+TT', 'Hoodie premium com capuz. Material de alta qualidade.', 20)
ON CONFLICT DO NOTHING;

-- Ver produtos inseridos
SELECT id, name, price, stock FROM products ORDER BY created_at DESC;
