import { useEffect, useState } from "react";

export default function useUser(supabase) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.onAuthStateChange((ev, session) => {
      if (session === null) return;
      setUser(session.user);
    });
    if (supabase.auth.session) setUser(supabase.auth.session.user);
  }, [supabase]);
  return user;
}
