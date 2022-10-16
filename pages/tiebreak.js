import { useEffect, useRef, useState } from "react";

import useSWR from "swr";

import { PARTITE_BOLGHERA } from "lib/const";
import { fetcher, throwIfNotOk } from "lib/helpers";
import supabase from "lib/supabaseClient";

export default function TieBreak() {
  // Tiebreak
  const [match, setMatch] = useState(null);
  // Supabase
  const [partita, setPartita] = useState(null);
  useEffect(() => {
    fetch("/api/vni/rest_api/pages/team?team_id=1411")
      .then(throwIfNotOk)
      .then((r) => r.json())
      .then((d) => {
        const todayDate = (
          process.env.NODE_ENV == "development"
            ? new Date("2022-10-08")
            : new Date()
        ).toLocaleDateString();
        const match = d.primeGiornate[0];
        const matchDate = new Date(
          "20" + match.date.split("-").reverse().join("-")
        ).toLocaleDateString();
        if (todayDate == matchDate) {
          setMatch(match);
        } else {
          setMatch(undefined);
        }
      })
      .catch((e) => {
        console.error(e);
        setMatch(false);
      });
    supabase
      .from(PARTITE_BOLGHERA)
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single()
      .then((p) => setPartita(p.data))
      .catch(() => setPartita(false));
  }, []);
  if (!supabase.auth.user()) {
    return "Nessun utente loggato";
  }
  if (match === null || partita === null) {
    return "Caricamento";
  }
  if (match === false) {
    return "Errore TieBreak";
  }
  if (partita === false) {
    return "Errore Supabase";
  }
  if (match === undefined) {
    return "Nessuna partita";
  }
  return <Match match={match} partita={partita} />;
}

function Match(props) {
  const { data } = useSWR(
    "/api/vni/rest_api/matches/" + props.match.id,
    fetcher,
    {
      refreshInterval: 5_000,
      refreshWhenHidden: true,
    }
  );
  const match = data?.matches[0];
  console.log(match);
  if (!match) return null;
  return <Punteggio match={match} partita={props.partita} />;
}

function Punteggio({ match, partita }) {
  const prev = useRef(null);
  useEffect(() => {
    if (prev.current != null) {
      const prev_match = prev.current;
      for (var i = 0; i <= 5; i++) {
        if (prev_match["hsset" + i] != match["hsset" + i]) break;
        if (prev_match["vsset" + i] != match["vsset" + i]) break;
      }
      if (i == 6) {
        console.log("Stale data");
      } else {
        console.log("Data needs update");
        const to_update = {};
        for (let i = 1; i <= 5; i++) {
          to_update["set" + i] = `${match["hsset" + (i - 1)]}-${
            match["vsset" + (i - 1)]
          }`;
        }
        supabase
          .from(PARTITE_BOLGHERA)
          .update(to_update)
          .eq("id", partita.id)
          .then();
      }
    }
    prev.current = match;
  }, [match, partita.id]);
  return <pre>{JSON.stringify({ match, partita }, null, 2)}</pre>;
}
