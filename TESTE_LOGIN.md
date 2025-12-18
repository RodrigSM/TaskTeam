# 🔐 COMO TESTAR O LOGIN

## ✅ Passo 1: Executar SQL no Supabase

1. Vai ao **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleciona o teu projeto
3. Menu **SQL Editor** → **New Query**
4. Cola este código:

```sql
-- Ativar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura pública
CREATE POLICY "Produtos públicos"
ON products FOR SELECT
TO public
USING (true);
```

5. Clica em **RUN**

---

## ✅ Passo 2: Criar Utilizador de Teste

### Opção A - Via Dashboard (Mais Fácil):
1. Menu **Authentication** → **Users**
2. Clica em **Add user** → **Create new user**
3. Preenche:
   - **Email**: `teste@taskteam.pt`
   - **Password**: `TaskTeam123!`
   - **Auto Confirm User**: ✅ **Marca esta opção**
4. Clica em **Create user**

### Opção B - Via SQL:
```sql
-- Criar utilizador diretamente
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@taskteam.pt',
  crypt('TaskTeam123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

---

## ✅ Passo 3: Testar o Login

1. **Abre a página**: http://localhost:5500/taskteam-website/index.html

2. **Clica no botão "LOGIN"** (no canto superior direito)

3. **Deve aparecer um modal bonito** com:
   - Campo de Email
   - Campo de Password
   - Botão "ENTRAR"
   - Botão "🔐 Login com Google"

4. **Preenche**:
   - Email: `teste@taskteam.pt`
   - Password: `TaskTeam123!`

5. **Clica em "ENTRAR"**

6. **Deve aparecer**:
   - Notificação verde: "Login realizado com sucesso!"
   - O botão muda para "LOGOUT"
   - O email aparece na navbar

---

## ❌ Se não funcionar:

### 1. Abre o Console (F12):
   - Deve aparecer: `"Login button clicked - event triggered!"`
   - Deve aparecer: `"Opening login modal"`
   - Deve aparecer: `"Modal should be visible now"`

### 2. Se o modal não aparecer:
   - Verifica se existe `<div id="login-modal">` no HTML
   - Verifica se o ficheiro `style.css` foi carregado

### 3. Se der erro no login:
   - Verifica se criaste o utilizador no Supabase
   - Verifica se marcaste "Auto Confirm User"
   - Tenta criar outro utilizador

---

## 🛍️ Testar a Loja:

1. **Abre**: http://localhost:5500/taskteam-website/loja.html

2. **Deve carregar produtos automaticamente** da base de dados

3. **Abre Console (F12)** e procura:
   - `"Loading store page - fetching products..."`
   - `"Products fetched:"` (com array de produtos)

4. **Se não aparecer produtos**:
   - Verifica se executaste o SQL de políticas RLS
   - Verifica se tens produtos na tabela `products`
   - Vê se há erros no Console

---

## 🎯 Credenciais de Teste:

📧 **Email**: `teste@taskteam.pt`  
🔒 **Password**: `TaskTeam123!`

---

## ⚙️ Configuração do Google OAuth (Opcional):

Se quiseres login com Google:

1. https://console.cloud.google.com
2. Cria projeto → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Authorized redirect URIs:
   ```
   https://gsdnkuierbrzqalxnfkd.supabase.co/auth/v1/callback
   ```
5. Copia Client ID e Secret
6. Cola no Supabase → Authentication → Providers → Google
