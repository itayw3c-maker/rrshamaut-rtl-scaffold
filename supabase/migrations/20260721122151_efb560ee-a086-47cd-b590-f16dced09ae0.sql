
-- 1. Leads: replace permissive INSERT policy with one that pins internal admin fields
DROP POLICY IF EXISTS "public insert leads" ON public.leads;
CREATE POLICY "public insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    agreed = true
    AND handled = false
    AND webhook_ok IS NULL
    AND webhook_response IS NULL
  );

-- 2. Storage: drop broad listing policy on media bucket; add admin/editor update+delete
DROP POLICY IF EXISTS "public read media bucket" ON storage.objects;

CREATE POLICY "staff update media bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND (public.current_user_is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role)))
  WITH CHECK (bucket_id = 'media' AND (public.current_user_is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role)));

CREATE POLICY "staff delete media bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND (public.current_user_is_admin() OR public.has_role(auth.uid(), 'editor'::public.app_role)));

-- 3. Lock down SECURITY DEFINER helper functions: revoke from PUBLIC/anon, keep for authenticated (needed by RLS policies) and service_role
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated, service_role;
