-- Adiciona campo de foto de capa ao supermercado
-- Separado do logo_url (logo pequena) para uso no hero full-width
-- Resolução recomendada: 1920x800px WebP, < 400KB

ALTER TABLE public.supermarkets
  ADD COLUMN IF NOT EXISTS cover_url text;
