// Re-export from the canonical client module.
// All env-var validation and client creation lives in ./supabase/client.ts.
import { createSupabaseBrowserClient } from "./supabase/client";

export { createSupabaseBrowserClient };

export const supabase = createSupabaseBrowserClient();
