# GuiaMaracanaú — Documentação Técnica Completa

> Guia oficial de negócios e serviços de Maracanaú/CE.  
> Atualizar este arquivo sempre que uma feature nova for adicionada ao sistema.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Banco de Dados — Schema Supabase](#5-banco-de-dados--schema-supabase)
6. [Autenticação Admin](#6-autenticação-admin)
7. [Páginas Públicas](#7-páginas-públicas)
8. [Páginas Admin](#8-páginas-admin)
9. [API Routes](#9-api-routes)
10. [Componentes](#10-componentes)
11. [Funções de Banco (database.ts)](#11-funções-de-banco-databasets)
12. [Utilitários (src/lib/)](#12-utilitários-srclib)
13. [Configuração da Cidade](#13-configuração-da-cidade)
14. [Analytics e Rastreamento](#14-analytics-e-rastreamento)
15. [Sistema de Imagens](#15-sistema-de-imagens)
16. [Deploy e Build](#16-deploy-e-build)
17. [Padrões e Convenções](#17-padrões-e-convenções)

---

## 1. Visão Geral

O **GuiaMaracanaú** é um diretório de negócios locais para a cidade de Maracanaú/CE. Permite que cidadãos encontrem estabelecimentos por categoria, bairro ou busca livre. Anunciantes podem solicitar cadastro via formulário de leads. O sistema também exibe cupons de desconto e encartes semanais de supermercados.

**Fluxo principal do usuário:**
1. Acessa a home → vê categorias populares, banner com destaque, feed de negócios
2. Filtra por categoria (`/categories/[slug]`) ou bairro (`/bairros/[slug]`)
3. Acessa o perfil do estabelecimento (`/business/[slug]`)
4. Copia cupom de desconto ou clica no WhatsApp do estabelecimento
5. Pode buscar pelo nome via busca flutuante → `/search?q=...`

**Fluxo do administrador:**
1. Login em `/admin/login` com senha → cookie `admin_session` (HMAC-SHA256)
2. CRUD completo de negócios, bairros, cupons, supermercados e encartes
3. Upload de imagens direto para o Supabase Storage

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.2.4 |
| Linguagem | TypeScript | ^5 |
| UI | React | 19.2.4 |
| Estilização | CSS Modules + variáveis CSS globais | — |
| Ícones | lucide-react | ^1.14.0 |
| Banco de Dados | Supabase (PostgreSQL) | ^2.105.1 |
| Storage | Supabase Storage | — |
| Busca | Fuse.js (fuzzy, client-side) | ^7.3.0 |
| Analytics | Google Analytics 4 (gtag) | — |
| Deploy | Vercel | — |
| Build local | Turbopack (não roda ESLint) | — |
| Build produção | Next.js webpack (roda ESLint) | — |

**Importante sobre o build:** O dev server usa Turbopack e não executa ESLint. O build de produção (Vercel/`next build` sem flag) roda ESLint. Erros de lint bloqueiam o deploy na Vercel.

---

## 3. Variáveis de Ambiente

Arquivo local: `.env.local`. Na Vercel: configurar em Project Settings > Environment Variables.

```env
# Supabase — obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://itjverfcnfomqoyerbtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # chave anon (pública)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # chave service_role (só servidor)

# Admin auth — obrigatórias
ADMIN_PASSWORD=senha_do_admin                  # senha em texto plano
ADMIN_SESSION_SECRET=segredo_para_hmac         # string aleatória longa

# Analytics — opcional (só produção)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# SEO / sitemap — opcional
NEXT_PUBLIC_SITE_URL=https://guiamaracanau.com.br
```

> `ADMIN_SESSION_SECRET` e `ADMIN_PASSWORD` são usados para gerar o token HMAC-SHA256 que fica no cookie `admin_session`. Nunca mudar em produção sem fazer logout antes.

---

## 4. Estrutura de Diretórios

```
GuiaDesconto/
├── src/
│   ├── app/                        # Rotas Next.js App Router
│   │   ├── page.tsx                # Home
│   │   ├── layout.tsx              # Root layout (Navbar, Footer, CookieConsent, GA)
│   │   ├── globals.css             # Variáveis CSS globais e estilos base
│   │   ├── page.module.css         # Estilos da home (reutilizado por outras páginas)
│   │   ├── about/
│   │   ├── advertise/              # Formulário de leads para anunciantes
│   │   ├── bairros/
│   │   │   ├── page.tsx            # Lista todos os bairros
│   │   │   └── [slug]/page.tsx     # Negócios de um bairro
│   │   ├── business/[slug]/        # Perfil do estabelecimento
│   │   ├── categories/
│   │   │   ├── page.tsx            # Grade de categorias
│   │   │   └── [slug]/             # Negócios de uma categoria + filtro de bairro
│   │   │       ├── page.tsx
│   │   │       ├── NeighborhoodFilter.tsx  # Re-exporta do componente compartilhado
│   │   │       └── category.module.css
│   │   ├── cupons/                 # Lista de cupons ativos
│   │   ├── search/                 # Busca fuzzy (Fuse.js, client-side)
│   │   ├── sitemap.xml/            # Sitemap dinâmico
│   │   ├── supermercados/          # Lista e detalhe de supermercados + encartes
│   │   ├── admin/                  # Área protegida (middleware)
│   │   │   ├── login/
│   │   │   ├── businesses/         # CRUD negócios
│   │   │   ├── bairros/            # CRUD bairros
│   │   │   ├── cupons/             # CRUD cupons
│   │   │   └── supermercados/      # CRUD supermercados + encartes
│   │   └── api/
│   │       ├── businesses/         # GET lista paginada (público)
│   │       ├── events/             # POST tracking (público)
│   │       └── admin/              # Todas as rotas admin (autenticadas)
│   ├── components/                 # Componentes React reutilizáveis
│   │   ├── AdminShell/
│   │   ├── BannerCarousel/
│   │   ├── BusinessCardImage/
│   │   ├── BusinessFeed/
│   │   ├── BusinessTracker/
│   │   ├── CookieConsent/
│   │   ├── CouponSection/
│   │   ├── CredibilityStrip/
│   │   ├── FloatingSearch/
│   │   ├── FlyerViewer/
│   │   ├── GoogleAnalytics/
│   │   ├── Navbar/
│   │   ├── NavSearch/
│   │   ├── NeighborhoodFilter/     # Popup multi-select de bairros (compartilhado)
│   │   └── WhatsAppButton/
│   ├── config/
│   │   └── city.ts                 # Configuração da cidade (nome, estado, email, etc.)
│   ├── lib/
│   │   ├── admin-auth.ts           # HMAC-SHA256 token para autenticação admin
│   │   ├── database.ts             # Todas as queries Supabase (lado servidor)
│   │   ├── storage.ts              # Upload de imagens para Supabase Storage
│   │   ├── supabase.ts             # Instância do cliente Supabase (anon key)
│   │   └── track.ts                # Função de rastreamento de eventos
│   └── proxy.ts                    # Middleware Next.js para proteção das rotas /admin
├── supabase/
│   └── migrations/                 # SQL para executar manualmente no Supabase
│       ├── 001_neighborhoods.sql
│       ├── 002_fix_business_images.sql
│       ├── 003_events.sql
│       └── 20260515_supermarkets.sql
├── next.config.ts                  # Configuração Next.js (imagens remotas)
├── eslint.config.mjs               # ESLint flat config (eslint-config-next)
├── package.json
└── SYSTEM.md                       # Este arquivo
```

---

## 5. Banco de Dados — Schema Supabase

O banco é gerenciado pelo **Supabase** (PostgreSQL). As migrations ficam em `supabase/migrations/` e devem ser executadas manualmente no SQL Editor do Supabase. **Não há CLI de migration automatizada.**

### 5.1 Tabela `businesses`

Tabela principal, existia antes das migrations documentadas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | Gerado automaticamente |
| `name` | `text NOT NULL` | Nome do estabelecimento |
| `slug` | `text UNIQUE NOT NULL` | URL amigável |
| `description` | `text` | Descrição curta |
| `address` | `text` | Endereço completo |
| `phone` | `text` | Telefone |
| `whatsapp` | `text` | Número WhatsApp (sem formatação) |
| `hours` | `text` | Horário de funcionamento |
| `website` | `text` | Site opcional |
| `image_url` | `text` | URL da imagem no Supabase Storage ou CDN |
| `rating` | `numeric` | Nota (0–5) |
| `reviews_count` | `int` | Número de avaliações |
| `featured` | `boolean` | Aparece no banner carousel da home |
| `discount_label` | `text` | Label do desconto (ex: "10% OFF") |
| `category_id` | `uuid FK → categories.id` | Categoria |
| `neighborhood_id` | `uuid FK → neighborhoods.id` | Bairro (adicionado em `001_neighborhoods.sql`) |
| `created_at` | `timestamptz` | — |
| `updated_at` | `timestamptz` | — |

**Indexes:** `businesses_neighborhood_idx (neighborhood_id)`

**RLS:** leitura pública; escrita via service_role (API admin).

---

### 5.2 Tabela `categories`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `name` | `text NOT NULL` | Nome da categoria |
| `slug` | `text UNIQUE NOT NULL` | URL amigável |
| `icon_name` | `text` | Nome do ícone Lucide (ex: `"Utensils"`) |
| `color` | `text` | Cor hexadecimal (ex: `"#ef4444"`) |
| `created_at` | `timestamptz` | — |

**RLS:** leitura pública.

---

### 5.3 Tabela `neighborhoods` (migration 001)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `name` | `text NOT NULL` | Nome do bairro |
| `slug` | `text UNIQUE NOT NULL` | URL amigável |
| `is_active` | `boolean DEFAULT true` | Controla visibilidade pública |
| `position` | `int DEFAULT 0` | Ordem de exibição |
| `created_at` | `timestamptz` | — |
| `updated_at` | `timestamptz` | — |

**Seed inicial:** 29 bairros de Maracanaú/CE cadastrados na migration.

**Indexes:** `neighborhoods_active_idx (is_active, position)`

**RLS:**
- `neighborhoods_public_select`: SELECT onde `is_active = true`
- `neighborhoods_service_all`: ALL para `auth.role() = 'service_role'`

---

### 5.4 Tabela `business_products`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `business_id` | `uuid FK → businesses.id CASCADE` | — |
| `name` | `text NOT NULL` | Nome do produto/serviço |
| `price` | `text` | Preço formatado (string) |
| `image_url` | `text` | Imagem do produto |
| `created_at` | `timestamptz` | — |

**RLS:** leitura pública.

---

### 5.5 Tabela `coupons`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `business_id` | `uuid FK → businesses.id` | — |
| `code` | `text NOT NULL` | Código do cupom |
| `discount_label` | `text NOT NULL` | Descrição do desconto |
| `description` | `text` | Descrição adicional |
| `expires_at` | `timestamptz` | NULL = sem expiração |
| `active` | `boolean DEFAULT true` | — |
| `created_at` | `timestamptz` | — |
| `updated_at` | `timestamptz` | — |

**RLS:** leitura pública filtrada pela query (só `active = true` e não expirados).

---

### 5.6 Tabela `events` (migration 003)

Tabela de analytics interno. Cada evento relevante do usuário é registrado aqui.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `event_type` | `text NOT NULL` | Tipo: `page_view_business`, `whatsapp_click`, `search`, `coupon_redeem`, `filter_neighborhood` |
| `business_id` | `uuid FK → businesses.id SET NULL` | Negócio relacionado (opcional) |
| `coupon_id` | `uuid FK → coupons.id SET NULL` | Cupom relacionado (opcional) |
| `metadata` | `jsonb DEFAULT '{}'` | Dados extras (ex: `{neighborhood_slug: "centro"}`) |
| `user_agent` | `text` | — |
| `referrer` | `text` | — |
| `session_id` | `text` | UUID aleatório em cookie (1 ano) |
| `created_at` | `timestamptz NOT NULL` | — |

**Indexes:**
- `events_type_created_idx (event_type, created_at DESC)`
- `events_business_idx (business_id, created_at DESC) WHERE business_id IS NOT NULL`

**RLS:**
- `events_insert_anon`: INSERT com `check (true)` — qualquer um pode inserir
- `events_select_service`: SELECT só para `service_role`

---

### 5.7 Tabela `leads`

Formulário de captação de anunciantes (`/advertise`). Inserção direta via cliente Supabase no frontend.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `company` | `text` | Nome da empresa |
| `responsible` | `text` | Nome do responsável |
| `whatsapp` | `text` | WhatsApp |
| `email` | `text` | E-mail |
| `address` | `text` | Endereço |
| `created_at` | `timestamptz` | — |

**RLS:** INSERT público; SELECT via service_role.

---

### 5.8 Tabela `supermarkets` (migration 20260515)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `name` | `text NOT NULL` | — |
| `slug` | `text UNIQUE NOT NULL` | — |
| `logo_url` | `text` | Logo pequena (400×400px, fundo transparente) |
| `cover_url` | `text` | Foto de capa para o hero full-width (1920×800px WebP). Migration: `20260521_supermarket_cover.sql`. **Executar manualmente no Supabase SQL Editor.** |
| `description` | `text` | — |
| `address` | `text` | — |
| `phone` | `text` | — |
| `active` | `boolean DEFAULT true` | — |
| `created_at` | `timestamptz` | — |

**RLS:** `public read supermarkets` — SELECT para todos.

---

### 5.9 Tabela `flyers` (migration 20260515)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `supermarket_id` | `uuid FK → supermarkets.id CASCADE` | — |
| `valid_from` | `date NOT NULL` | Data de início da validade |
| `valid_until` | `date NOT NULL` | Data de fim da validade |
| `pages` | `text[] DEFAULT '{}'` | Array de URLs das páginas do encarte. **Padrão de imagem: 900×1200px (retrato 3:4), WebP, <500KB por página.** |
| `active` | `boolean DEFAULT true` | — |
| `created_at` | `timestamptz` | — |

**RLS:** `public read flyers` — SELECT para todos.

---

### 5.10 Tabela `flyer_highlights` (migration 20260515)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` PK | — |
| `flyer_id` | `uuid FK → flyers.id CASCADE` | — |
| `product_name` | `text NOT NULL` | Nome do produto em destaque |
| `original_price` | `numeric(10,2)` | Preço original (opcional) |
| `sale_price` | `numeric(10,2) NOT NULL` | Preço promocional |
| `image_url` | `text` | Imagem do produto |
| `created_at` | `timestamptz` | — |

**RLS:** `public read flyer_highlights` — SELECT para todos.

---

## 6. Autenticação Admin

Autenticação baseada em **senha + HMAC-SHA256** sem banco de dados de sessão.

### Fluxo

1. Admin acessa `/admin/login` e envia a senha
2. `POST /api/admin/login` recebe a senha, chama `computeToken()`
3. `computeToken()` assina `ADMIN_PASSWORD` com `ADMIN_SESSION_SECRET` via Web Crypto API (HMAC-SHA256), retorna hex string
4. Token é salvo em cookie `httpOnly`, `sameSite: lax`, `path: /admin`, duração 8h
5. Em todas as rotas `/admin/*` (exceto `/admin/login`), o middleware em `src/proxy.ts` intercepta a request, recomputa o token esperado e compara com o cookie
6. Se inválido → redirect para `/admin/login`
7. Todas as API routes admin também chamam `requireAdminAuth(req)` antes de qualquer operação

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/proxy.ts` | Middleware Next.js — intercepta `/admin/:path*`, valida cookie |
| `src/lib/admin-auth.ts` | `computeToken()` e `requireAdminAuth()` |
| `src/app/api/admin/login/route.ts` | POST — valida senha, seta cookie |
| `src/app/api/admin/logout/route.ts` | POST — limpa cookie |

> **Atenção:** Não há invalidação de sessão no banco. Mudar `ADMIN_SESSION_SECRET` invalida todos os cookies existentes imediatamente.

---

## 7. Páginas Públicas

### `GET /`
**Arquivo:** `src/app/page.tsx`  
**Renderização:** SSR dinâmico (`force-dynamic`)

Carrega em paralelo:
- `getCategories()` → grade de categorias
- `getFeaturedBusinesses()` → `BannerCarousel` (destaque)
- `getBusinessesPaginated(0, 12)` → `BusinessFeed` (infinite scroll)
- `getSupermarkets()` → teaser de encartes
- `getNeighborhoodsWithCount()` → contagem para exibição

**SearchParams aceitos:** `?bairros=slug1,slug2` — filtra o feed e o carregamento inicial por bairros selecionados. Os slugs são resolvidos para IDs no servidor e passados para `getBusinessesPaginated()` e para o `BusinessFeed` (infinite scroll mantém o filtro).

---

### `GET /categories`
**Arquivo:** `src/app/categories/page.tsx`  
Lista todas as categorias com ícone e cor. Links para `/categories/[slug]`.

---

### `GET /categories/[slug]`
**Arquivo:** `src/app/categories/[slug]/page.tsx`  
**SearchParams aceitos:** `?bairros=slug1,slug2` (múltipla seleção via popup)

Exibe todos os negócios de uma categoria. Usa `NeighborhoodFilter` (popup multi-select) para filtrar por bairro(s). Os slugs de bairro são resolvidos para IDs via query `.in("slug", activeSlugs)`, depois passados para `getBusinessesByCategory(slug, neighborhoodIds)`.

**Componente de filtro:** `NeighborhoodFilter` (re-exportado de `src/components/NeighborhoodFilter/`)

---

### `GET /bairros`
**Arquivo:** `src/app/bairros/page.tsx`  
Lista todos os bairros ativos com contagem de negócios, ordenados por contagem.

---

### `GET /bairros/[slug]`
**Arquivo:** `src/app/bairros/[slug]/page.tsx`  
Exibe todos os negócios de um bairro específico. Inclui JSON-LD Schema.org.

---

### `GET /business/[slug]`
**Arquivo:** `src/app/business/[slug]/page.tsx`  
Perfil completo do estabelecimento:
- Imagem hero, nome, categoria, bairro, rating
- Descrição, endereço, horário, telefone, site
- Produtos/serviços (`business_products`)
- WhatsApp CTA via `WhatsAppButton`
- `BusinessTracker` (registra `page_view_business` na tabela events)
- Cupons ativos do estabelecimento via `CouponSection`

---

### `GET /cupons`
**Arquivo:** `src/app/cupons/page.tsx`  
Lista todos os cupons ativos e não expirados. Usa `CouponSection` com copy-to-clipboard e link WhatsApp.

---

### `GET /search`
**Arquivo:** `src/app/search/page.tsx`  
**Renderização:** `force-dynamic` (obrigatório — usa `searchParams`)  
**SearchParams:** `?q=termo`

Passa a query para `SearchClient` (client component). A busca é feita client-side com **Fuse.js**:
- Carrega todos os negócios via `GET /api/businesses`
- Normaliza acentos antes de comparar
- Threshold: `0.45`, pesos: nome `0.6`, descrição `0.25`, categoria `0.15`

---

### `GET /supermercados`
**Arquivo:** `src/app/supermercados/page.tsx`  
Lista supermercados ativos com badge de encarte ativo.

---

### `GET /supermercados/[slug]`
**Arquivo:** `src/app/supermercados/[slug]/page.tsx`  
Detalhe do supermercado com o encarte ativo:
- **Hero full-width:** usa `cover_url` como background (1920×800px); fallback para `logo_url`; fallback final para gradiente `var(--primary)`. Overlay escuro gradiente → nome e botão voltar sobrepostos.
- **Info bar:** endereço, telefone, validade do encarte, descrição (abaixo do hero)
- Highlights do encarte (produtos em oferta em grid)
- `FlyerViewer` — lightbox com todas as páginas do encarte (array de URLs)

---

### `GET /advertise`
**Arquivo:** `src/app/advertise/page.tsx`  
Formulário de captação de leads para anunciantes. Faz INSERT direto na tabela `leads` via cliente Supabase (anon key, inserção pública). Campos: empresa, responsável, WhatsApp, email, endereço.

---

### `GET /about`
**Arquivo:** `src/app/about/page.tsx`  
Página estática com missão, valores e CTA para anunciantes.

---

## 8. Páginas Admin

Todas protegidas pelo middleware `src/proxy.ts`. Layout gerenciado por `AdminShell`.

| Rota | Função |
|------|--------|
| `/admin/login` | Formulário de login com senha |
| `/admin/businesses` | Tabela CRUD de negócios. Filtro `?missing_neighborhood=1` lista negócios sem bairro |
| `/admin/businesses/new` | Formulário `BusinessForm` — cria negócio com upload de imagem e produtos |
| `/admin/businesses/[id]/edit` | Edição completa + CRUD de produtos aninhado |
| `/admin/bairros` | `NeighborhoodManager` — criar, ativar/desativar, reordenar bairros por posição |
| `/admin/cupons` | Tabela CRUD de cupons com status e expiração |
| `/admin/cupons/new` | `CouponForm` — código auto-gerado a partir do `discount_label` |
| `/admin/cupons/[id]/edit` | Edição de cupom |
| `/admin/supermercados` | Tabela CRUD de supermercados com status do encarte ativo |
| `/admin/supermercados/new` | `SupermarketForm` — cria supermercado |
| `/admin/supermercados/[id]/edit` | Edição de supermercado |
| `/admin/supermercados/[id]/encartes` | Lista de encartes do supermercado |
| `/admin/supermercados/[id]/encartes/new` | Cria encarte com datas de validade, páginas e highlights |
| `/admin/supermercados/[id]/encartes/[flyerId]/edit` | Edita encarte e gerencia highlights |

---

## 9. API Routes

### Públicas

#### `GET /api/businesses`
Lista negócios paginados para o infinite scroll.

**Query params:**
| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `offset` | int | 0 | Posição de início |
| `limit` | int | 12 | Quantidade (max: 48) |
| `neighborhoodIds` | string | — | IDs separados por vírgula para filtrar por bairro(s) |

**Response:** `Business[]` com relações `categories(name)` e `neighborhoods(name, slug)`.  
**Ordenação:** `featured DESC`, `name ASC`.

---

#### `POST /api/events`
Registra evento de analytics na tabela `events`.

**Body:**
```json
{
  "event_type": "page_view_business | whatsapp_click | search | coupon_redeem | filter_neighborhood",
  "business_id": "uuid (opcional)",
  "coupon_id": "uuid (opcional)",
  "metadata": {}
}
```

Gera/reutiliza cookie `session_id` (UUID, 1 ano). Salva `user_agent` e `referrer` do request.

---

### Admin (todas requerem cookie `admin_session` válido)

#### `/api/admin/login`
`POST` — Recebe `{password}`, computa HMAC, seta cookie `admin_session` (8h).

#### `/api/admin/logout`
`POST` — Limpa o cookie `admin_session`.

#### `/api/admin/businesses`
- `GET` — Lista todos os negócios
- `POST` — Cria negócio. Body: campos de `businesses` + `products[]`

#### `/api/admin/businesses/[id]`
- `GET` — Busca negócio por ID com produtos
- `PUT` — Atualiza negócio. Faz UPSERT dos produtos (DELETE + INSERT)
- `DELETE` — Remove negócio

#### `/api/admin/businesses/[id]/products`
`POST` / `DELETE` — CRUD individual de produtos do negócio.

#### `/api/admin/coupons` / `/api/admin/coupons/[id]`
CRUD completo de cupons.

#### `/api/admin/neighborhoods` / `/api/admin/neighborhoods/[id]`
CRUD de bairros. O POST auto-incrementa `position` e slugifica o nome.

#### `/api/admin/supermarkets` / `/api/admin/supermarkets/[id]`
CRUD de supermercados.

#### `/api/admin/flyers` / `/api/admin/flyers/[id]`
CRUD de encartes. `pages` é um array de URLs de imagens.

#### `/api/admin/flyers/[id]/highlights`
`POST` — Adiciona highlight a um encarte.

#### `/api/admin/highlights/[id]`
`PUT` / `DELETE` — Edita ou remove highlight.

---

## 10. Componentes

### `BannerCarousel`
**Arquivo:** `src/components/BannerCarousel/`  
**Props:** `businesses: Business[]`

Carousel hero com os negócios `featured`. Rotação automática a cada 4.5s. Máximo 5 slides. Dots de navegação clicáveis. Transição com `opacity` + `scale` (0.7s ease). Exibe: imagem de fundo, tag de categoria, nome, descrição (truncada 2 linhas), CTA "Ver estabelecimento →".

**Layout:** `width: calc(100% - 1rem)` — próximo das bordas, centralizado. Altura 420px desktop / 280px mobile.

---

### `BusinessFeed`
**Arquivo:** `src/components/BusinessFeed/`  
**Props:** `initial: Business[], neighborhoodIds?: string[]`

Infinite scroll com `IntersectionObserver` (rootMargin: 200px). Carrega 12 por página via `GET /api/businesses?offset=N&limit=12&neighborhoodIds=...`. Deduplica por `id`. Quando `neighborhoodIds` muda (filtro de bairro ativo), reseta o feed ao estado inicial.

---

### `NeighborhoodFilter`
**Arquivo:** `src/components/NeighborhoodFilter/`  
**Props:** `neighborhoods: Neighborhood[], active: string[]`

Componente client-side para filtrar por bairros. Renderiza um botão "Pesquisar por bairro" que abre um popup modal com checkboxes para múltipla seleção. Ao aplicar, atualiza a URL com `?bairros=slug1,slug2`. Chips ativos com remoção individual exibidos abaixo do botão.

**Funcionalidades:**
- Fecha com `Esc` ou clique no overlay
- Badge com contagem de bairros selecionados
- "Limpar tudo" remove todos de uma vez
- CSS usa `rgba(91, 33, 182, ...)` para manter identidade visual do sistema

**Usado em:** home page (`/`) e páginas de categoria (`/categories/[slug]`).

---

### `BusinessCardImage`
**Arquivo:** `src/components/BusinessCardImage/`  
**Props:** `url?: string, name: string`

Se `url` existe: renderiza `<Image>` do Next.js com `fill` e `object-fit: cover`. Se não: mostra gradiente roxo com as iniciais do nome.

---

### `FloatingSearch`
**Arquivo:** `src/components/FloatingSearch/`

FAB fixo (lupa) no canto da tela. Ao clicar, abre modal de busca centralizado. `Enter` → navega para `/search?q=termo`. `Esc` → fecha. Rastreia evento `search` via `track()`.

---

### `CouponSection`
**Arquivo:** `src/components/CouponSection/`  
**Props:** `coupons: Coupon[], emptyMessage?: string, hideHeader?: boolean`

Grid de cards de cupom. Cada card:
- Exibe código, desconto, nome do negócio, expiração
- Botão "Copiar código" (clipboard API)
- Controle de resgate via `localStorage` (chave: `coupon_redeemed_[id]`) — persiste por 24h
- Link WhatsApp direto para o negócio

---

### `FlyerViewer`
**Arquivo:** `src/components/FlyerViewer/`  
**Props:** `pages: string[]`

Visualizador de encartes em lightbox. Navegação com setas ← →, teclado (ArrowLeft/ArrowRight/Escape), contador de páginas, dots clicáveis. `max-height: 80vh` para acomodar páginas no formato padrão 900×1200px (retrato).

---

### `BusinessTracker`
**Arquivo:** `src/components/BusinessTracker/`  
**Props:** `businessId: string`

Componente client-side invisível. No `useEffect` (mount), chama `track("page_view_business", { business_id })`.

---

### `WhatsAppButton`
**Arquivo:** `src/components/WhatsAppButton/`  
**Props:** `whatsapp: string, businessId: string, className?: string`

Link `https://wa.me/[numero]`. Ao clicar, rastreia evento `whatsapp_click` com o `businessId`.

---

### `AdminShell`
**Arquivo:** `src/components/AdminShell/`  
**Props:** `children: React.ReactNode`

Layout da área admin. Sidebar com links: Negócios, Bairros, Cupons, Supermercados. Botão de logout (chama `POST /api/admin/logout`, redireciona para `/admin/login`).

---

### `CookieConsent`
**Arquivo:** `src/components/CookieConsent/`

Banner de consentimento de cookies (LGPD). Usa `localStorage` com chave `cookie_consent`. Aparece na primeira visita. Ao aceitar, some permanentemente.

---

### `GoogleAnalytics`
**Arquivo:** `src/components/GoogleAnalytics/`

Injeta o script `gtag.js` do GA4. Só carrega quando `NEXT_PUBLIC_GA_ID` está definido e `NODE_ENV === 'production'`.

---

## 11. Funções de Banco (database.ts)

Todas as funções usam a instância `supabase` com **anon key**. Queries de leitura pública. Queries de escrita são feitas nas API routes admin usando a **service_role key**.

| Função | Tabelas | Filtros | Uso |
|--------|---------|---------|-----|
| `getNeighborhoods()` | `neighborhoods` | `is_active = true`, ORDER BY `position` | Filtro de bairros nos formulários e filtros |
| `getNeighborhoodBySlug(slug)` | `neighborhoods` | `slug = ?`, `is_active = true` | Detalhe do bairro |
| `getNeighborhoodsWithCount()` | `neighborhoods` + `businesses(count)` | `is_active = true` | Home page, página `/bairros` |
| `getBusinessesByNeighborhood(slug)` | `businesses`, `neighborhoods` | `neighborhood_id = hood.id` | `/bairros/[slug]` |
| `getCategories()` | `categories` | ORDER BY `name` | Grade de categorias |
| `getFeaturedBusinesses()` | `businesses` | `featured = true`, LIMIT 20 | Banner carousel |
| `getBusinessesPaginated(offset, limit, neighborhoodIds?)` | `businesses` + relações | `neighborhoodIds`: `.eq()` se 1, `.in()` se múltiplos | Home feed + API paginação |
| `getBusinessesByCategory(slug, neighborhoodIds?)` | `businesses`, `categories` | `category_id = cat.id` + `neighborhoodIds` opcional | `/categories/[slug]` |
| `getCoupons()` | `coupons` + `businesses` | `active = true`, `expires_at IS NULL OR > now()` | `/cupons` |
| `getBusinessBySlug(slug)` | `businesses` + `categories` + `business_products` | `slug = ?` | `/business/[slug]` |
| `getSupermarkets()` | `supermarkets` + `flyers` | `active = true`; `activeFlyer` filtrado por data | Home teaser, `/supermercados` |
| `getSupermarketBySlug(slug)` | `supermarkets` + `flyers` + `flyer_highlights` | `slug = ?`, `active = true` | `/supermercados/[slug]` |

---

## 12. Utilitários (src/lib/)

### `supabase.ts`
Cria e exporta a instância do cliente Supabase com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Instância única (singleton via módulo ES).

### `admin-auth.ts`

```typescript
computeToken(): Promise<string>
// HMAC-SHA256(ADMIN_SESSION_SECRET, ADMIN_PASSWORD) → hex string

requireAdminAuth(req: NextRequest): Promise<NextResponse | null>
// Retorna 401 JSON se token inválido, null se OK
```

### `storage.ts`
```typescript
uploadImage(file: File, folder: string): Promise<string>
// Upload para bucket "guia-images" no Supabase Storage
// Retorna URL pública: https://[project].supabase.co/storage/v1/object/public/guia-images/[folder]/[filename]
```

### `track.ts`
```typescript
track(event_type: string, payload?: { business_id?, coupon_id?, metadata? }): void
// Fetch POST /api/events com keepalive: true
// Não bloqueia a thread (fire-and-forget)
```

**Eventos rastreados:**
| Event Type | Disparado em |
|-----------|-------------|
| `page_view_business` | Mount do `BusinessTracker` |
| `whatsapp_click` | Click no `WhatsAppButton` |
| `search` | Submit no `FloatingSearch` |
| `coupon_redeem` | Click em "Resgatar" no `CouponSection` |
| `filter_neighborhood` | Apply no `NeighborhoodFilter` |

---

## 13. Configuração da Cidade

**Arquivo:** `src/config/city.ts`

```typescript
export const cityConfig = {
  name: "Maracanaú",
  state: "Ceará",
  appTitle: "GuiaMaracanaú",
  description: "O guia oficial de negócios e serviços de Maracanaú.",
  contactEmail: "contato@guiamaracanau.com.br",
  primaryColor: "#2563eb",
};
```

Usado em toda a aplicação para textos dinâmicos com o nome da cidade. Para replicar o sistema para outra cidade, alterar apenas este arquivo.

> **Nota:** O `primaryColor` aqui é `#2563eb` (azul), mas o CSS global usa `--primary: #5b21b6` (roxo). O `cityConfig.primaryColor` não é usado pelo sistema de design atual.

---

## 14. Analytics e Rastreamento

O sistema tem **duas camadas de analytics**:

### Camada 1 — Tabela `events` (analytics próprio)
- Rastreia eventos customizados com dados de negócio, cupom e metadata
- Acessível via service_role key no Supabase
- Session via cookie `session_id` (UUID aleatório, 1 ano, httpOnly)
- Sem PII (não rastreia usuário identificável)

### Camada 2 — Google Analytics 4
- Script `gtag.js` carregado via `GoogleAnalytics` component
- Só ativo quando `NEXT_PUBLIC_GA_ID` definido e `NODE_ENV === 'production'`
- Pageviews automáticos via Next.js router

---

## 15. Sistema de Imagens

### Upload (admin)
- **Bucket:** `guia-images` no Supabase Storage (público)
- **Pastas:** `businesses/`, `products/`, `supermarkets/`, `flyers/`
- **Função:** `uploadImage(file, folder)` em `src/lib/storage.ts`
- **URL pública:** `https://itjverfcnfomqoyerbtz.supabase.co/storage/v1/object/public/guia-images/[pasta]/[arquivo]`

### Renderização (front)
- Componente `<Image>` do Next.js com `fill` + `object-fit: cover`
- Domínios permitidos em `next.config.ts`: Supabase CDN + `images.unsplash.com`
- Formatos automáticos: AVIF, WebP
- Fallback: gradiente roxo com iniciais (via `BusinessCardImage`)

---

## 16. Deploy e Build

### Desenvolvimento local
```bash
npm run dev     # Next.js com Turbopack (sem lint)
```

### Build de produção
```bash
npm run build   # Next.js webpack (com lint + TypeScript check)
npm run start   # Servidor de produção
```

### Deploy na Vercel
1. Importar repositório no Vercel
2. Configurar todas as variáveis de ambiente (seção 3)
3. Build command: `npm run build` (padrão)
4. Output directory: `.next` (padrão)

**Gotchas:**
- Páginas que usam `searchParams` precisam de `export const dynamic = "force-dynamic"` para não quebrar no prerender da Vercel
- Turbopack local não roda ESLint; webpack da Vercel roda — erros de lint bloqueiam deploy
- `SUPABASE_SERVICE_ROLE_KEY` deve estar em Server-only env vars (sem `NEXT_PUBLIC_`)

---

## 17. Padrões e Convenções

### CSS
- **CSS Modules** para todos os componentes (arquivo `.module.css` por componente)
- **Variáveis CSS globais** em `src/app/globals.css`:
  - `--primary: #5b21b6` — roxo principal
  - `--secondary: #0ea5e9` — azul secundário
  - `--accent: #f97316` — laranja (CTAs, badges)
  - `--background: #f5f4f9` — fundo da página
  - `--surface: #ffffff` — fundo de cards
  - `--surface-border: rgba(91, 33, 182, 0.12)` — bordas
  - `--text-main: #1e1b4b` — texto principal
  - `--text-muted: #6b7280` — texto secundário
- Classe `glass-card` = card branco com borda roxa suave e sombra
- Classe `gradient-text` = texto com gradiente roxo→azul
- Classe `container` = max-width 1200px, padding 0 1.5rem
- Classe `section` = padding vertical 4rem

### URL / Slugs
- Slugs gerados a partir do nome: lowercase, acentos removidos, espaços → hífens
- Todos os recursos são identificados por slug nas URLs públicas

### Filtro de bairros
- Parâmetro URL: `?bairros=slug1,slug2` (vírgula como separador, múltiplos slugs)
- Resolução de slugs → IDs feita no servidor antes de passar para as queries
- Filtro com `.eq()` para 1 bairro, `.in()` para múltiplos

### Tracking
- Sempre usar `track()` de `src/lib/track.ts` — nunca fetch direto para `/api/events`
- Usar `keepalive: true` para não perder eventos em navegações rápidas

### Dados dinâmicos vs. estáticos
- Páginas com `searchParams` → obrigatório `export const dynamic = "force-dynamic"`
- Páginas puramente estáticas → sem a diretiva (Next.js pré-renderiza automaticamente)

---

*Última atualização: 2026-05-21*  
*Manter este arquivo atualizado a cada nova feature adicionada ao sistema.*
