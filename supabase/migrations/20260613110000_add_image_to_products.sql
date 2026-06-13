-- Add image column to products table if it doesn't already exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image TEXT;

-- Update existing seeded products with their corresponding images
UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&q=80' 
WHERE id = '11000000-0000-0000-0000-000000000001'::uuid AND image IS NULL;

UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1681412338275-c7e6c466fb04?w=400&q=80' 
WHERE id = '22000000-0000-0000-0000-000000000002'::uuid AND image IS NULL;

UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80' 
WHERE id = '33000000-0000-0000-0000-000000000003'::uuid AND image IS NULL;

UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1611339555312-e607c83ce92c?w=400&q=80' 
WHERE id = '44000000-0000-0000-0000-000000000004'::uuid AND image IS NULL;

UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80' 
WHERE id = '55000000-0000-0000-0000-000000000005'::uuid AND image IS NULL;

UPDATE public.products 
SET image = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' 
WHERE id = '66000000-0000-0000-0000-000000000006'::uuid AND image IS NULL;
