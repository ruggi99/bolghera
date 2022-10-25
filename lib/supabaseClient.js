import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ytazfaaqthtbogrdthjf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzMyODQ2MywiZXhwIjoxOTM4OTA0NDYzfQ.qERtQfqDfQF7_ekIPvmfa7YBXswXGOEfQCz0qcUQOp8"
);
supabase.auth.onAuthStateChange(
  (ev, session) => (supabase.auth.session = session)
);

if (typeof window != "undefined") {
  console.log("supabase client initialized");
  window.supabase = supabase;
}

export default supabase;
