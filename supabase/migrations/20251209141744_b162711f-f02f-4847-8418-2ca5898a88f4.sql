-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_pk_user_id UUID REFERENCES public.private_key_users(id) ON DELETE SET NULL,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_pk_user_id UUID REFERENCES public.private_key_users(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_usd NUMERIC NOT NULL,
  shipping_price_usd NUMERIC NOT NULL DEFAULT 0,
  total_price_usd NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
  shipping_address TEXT,
  tracking_number TEXT,
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT one_buyer_type CHECK (
    (buyer_user_id IS NOT NULL AND buyer_pk_user_id IS NULL) OR
    (buyer_user_id IS NULL AND buyer_pk_user_id IS NOT NULL)
  ),
  CONSTRAINT one_seller_type CHECK (
    (seller_user_id IS NOT NULL AND seller_pk_user_id IS NULL) OR
    (seller_user_id IS NULL AND seller_pk_user_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Buyers can view their orders"
ON public.orders FOR SELECT
USING (buyer_user_id = auth.uid());

CREATE POLICY "Sellers can view orders for their listings"
ON public.orders FOR SELECT
USING (seller_user_id = auth.uid());

CREATE POLICY "Buyers can create orders"
ON public.orders FOR INSERT
WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY "Sellers can update order status"
ON public.orders FOR UPDATE
USING (seller_user_id = auth.uid());

CREATE POLICY "Buyers can update their orders"
ON public.orders FOR UPDATE
USING (buyer_user_id = auth.uid());

-- Trigger to update orders updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();