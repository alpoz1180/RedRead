-- ============================================================
-- 006: Critical fixes
-- - delete_user RPC (hesap silme)
-- - handle_new_auth_user loop guard (sonsuz döngü koruması)
-- - users(username) ve users(email) index'leri
-- ============================================================

-- ─── delete_user RPC ─────────────────────────────────────────
-- Authenticated kullanıcının kendi auth.users kaydını siler.
-- SECURITY DEFINER gerekli çünkü auth şemasına erişim yetkisi lazım.

CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sadece oturum açmış kullanıcı kendi hesabını silebilir
REVOKE ALL ON FUNCTION delete_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;


-- ─── handle_new_auth_user loop guard ─────────────────────────
-- Suffix 9999'u geçerse loop sonlanır, username_<timestamp> fallback kullanılır.

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix        INTEGER := 0;
BEGIN
  base_username := regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
  base_username := left(base_username, 30);
  final_username := base_username;

  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username) AND suffix < 9999 LOOP
    suffix := suffix + 1;
    final_username := left(base_username, 27) || '_' || suffix;
  END LOOP;

  -- Loop guard tetiklendiyse timestamp fallback
  IF suffix >= 9999 THEN
    final_username := left(base_username, 20) || '_' || extract(epoch from now())::bigint;
  END IF;

  INSERT INTO public.users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── users index'leri ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email    ON public.users(email);
