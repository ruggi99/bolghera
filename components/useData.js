import { useEffect, useState } from "react";

import { PARTITE_BOLGHERA } from "lib/const";
import { reduceSetCorto, reduceSetNormale } from "lib/helpers";

async function fetchData(supabase, id, callback) {
  const data = supabase
    .from(PARTITE_BOLGHERA)
    .select("*")
    .order("id", { ascending: false });
  if (id) {
    data.eq("id", id);
  }
  return data
    .limit(1)
    .single()
    .then((r) => (callback ? callback(r.data) : r.data));
}

function addAdditionalData(data) {
  const setKeys = Object.keys(data).filter((k) => k.startsWith("set"));
  const set1Bol = reduceSetNormale(data, setKeys.slice(0, 4), true);
  const set2Bol = reduceSetCorto(data, setKeys.slice(4, 5), true);
  const set1Avv = reduceSetNormale(data, setKeys.slice(0, 4), false);
  const set2Avv = reduceSetCorto(data, setKeys.slice(4, 5), false);
  data.setKeys = setKeys;
  data.setBol = set1Bol + set2Bol;
  data.setAvv = set1Avv + set2Avv;
  return data;
}

export default function useData(supabase, id) {
  var [partita, setPartita] = useState(null);
  useEffect(() => {
    if (id === false) return;
    if (id && isNaN(parseInt(id))) {
      console.error("Id non compatibile");
      return;
    }
    async function _fetchData() {
      const partita = await fetchData(supabase, id);
      setPartita(addAdditionalData(partita));
      supabase
        .channel("public: " + PARTITE_BOLGHERA)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: PARTITE_BOLGHERA,
            filter: `id=eq.${partita.id}`,
          },
          (r) => setPartita(addAdditionalData(r.new))
        )
        .subscribe((status) => {
          // Ogni volta che la connessione websocket viene aperta, riscarico i dati
          if (status != "SUBSCRIBED") return;
          fetchData(supabase, id, (data) =>
            setPartita(addAdditionalData(data))
          );
        });
    }
    _fetchData();
  }, [id, supabase]);
  return partita;
}
