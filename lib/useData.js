import { useEffect, useRef, useState } from "react";

import { PARTITE_BOLGHERA } from "lib/const";
import { throwIfNotOk } from "lib/helpers";
import supabase from "lib/supabaseClient";

/**
 * null -> Caricamento
 * undefined -> No data
 * false -> Errore
 */

export function useSupabase() {
  const [data, setData] = useState(null);

  useEffect(() => {
    supabase
      .from(PARTITE_BOLGHERA)
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .single()
      .then((p) => setData(p.data))
      .catch(() => setData(false));
  }, []);

  return data;
}

export function useData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then(throwIfNotOk)
      .then((r) => r.json())
      .then((d) => {
        const todayDate = (
          process.env.NODE_ENV == "development"
            ? new Date("2022-10-08")
            : new Date()
        ).toJSON();
        const match = Object.entries(d).find(
          ([, body]) =>
            body.type == "federvolley" &&
            body.inizio.substring(0, 8) ==
              todayDate.replaceAll("-", "").substring(0, 8)
        );
        console.log(todayDate, match, d);
        setData(match);
      })
      .catch((e) => {
        console.error(e);
        setData(false);
      });
  }, []);

  return data;
}

export function useNewb(numeroGara) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!numeroGara) return;
    fetch("https://rebasp.newb.it/jsonGara.asp?GaraNumero=" + numeroGara)
      .then(throwIfNotOk)
      .then((r) => r.json())
      .then(setData);
  }, [numeroGara]);

  return data;
}

export function useSSE(numeroGara) {
  const [data, setData] = useState(null);
  const SSE = useRef();

  useEffect(() => {
    if (!numeroGara) return;
    const sse = new EventSource("https://rebtv.newb.it/sse-notifications");
    sse.addEventListener("alert", (e) => {
      const parsed = JSON.parse(e.data);
      if (!parsed) return;
      if (parsed.gara.numero != numeroGara) return;
      setData(parsed);
    });
    SSE.current = sse;
  }, [numeroGara]);

  return data;
}
