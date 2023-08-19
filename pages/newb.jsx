import { useEffect } from "react";

import { PARTITE_BOLGHERA } from "lib/const";
import useUser from "lib/hooks/useUser";
import supabase from "lib/supabaseClient";
import { useNewb, useSSE, useSupabase } from "lib/useData";
import { useData } from "lib/useData";

export default function TieBreak() {
  // Newb
  const match = useData();
  // Supabase
  const partita = useSupabase();
  const user = useUser(supabase);

  if (!user) {
    return "Nessun utente loggato";
  }
  if (match === null || partita === null) {
    return "Caricamento";
  }
  if (match === false) {
    return "Errore Newb";
  }
  if (partita === false) {
    return "Errore Supabase";
  }
  if (match === undefined) {
    return "Nessuna partita";
  }

  return <Match match={match} partita={partita} />;
}

function Match({ match, partita }) {
  const newb = useNewb(match[0]);
  const newbSSE = useSSE(match[0]);
  console.log(match, newb, newbSSE);
  if (!newb) return "Caricamento";
  return <Punteggio match={newbSSE ?? newb} partita={partita} />;
}

function Punteggio({ match, partita }) {
  console.log("Punteggio", match);
  useEffect(() => {
    if (match.set.length == 0) return;
    const to_update = {};
    for (var set of match.set) {
      to_update["set" + set.numero] = set.casa + "-" + set.ospite;
    }
    supabase
      .from(PARTITE_BOLGHERA)
      .update(to_update)
      .eq("id", partita.id)
      .then();
  }, [match, partita.id]);
  return <pre>{JSON.stringify({ match, partita }, null, 2)}</pre>;
}
