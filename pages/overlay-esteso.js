import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const PARTITE_BOLGHERA = "partite_bolghera";

const supabase = createClient(
  "https://ytazfaaqthtbogrdthjf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzMyODQ2MywiZXhwIjoxOTM4OTA0NDYzfQ.qERtQfqDfQF7_ekIPvmfa7YBXswXGOEfQCz0qcUQOp8"
);

function Punteggio() {
  const router = useRouter();
  var [partita, setPartita] = useState({});
  useEffect(() => {
    async function fetchData() {
      if (!router.isReady) return;
      const { id } = router.query;
      if (id && isNaN(parseInt(id))) {
        console.error("Id non compatibile");
        return;
      }
      const table = supabase
        .from(PARTITE_BOLGHERA)
        .select("*")
        .order("id", { ascending: false });
      if (id) {
        table.eq("id", id);
      }
      const partita = await table
        .limit(1)
        .single()
        .then((r) => (setPartita(r.data), r.data));
      supabase
        .from(`${PARTITE_BOLGHERA}:id=eq.${partita.id}`)
        .on("UPDATE", (r) => setPartita(r.new))
        .subscribe();
    }
    fetchData();
  }, [router.isReady]);
  partita = { ...partita };
  const setKeys = Object.keys(partita).filter((k) => k.startsWith("set"));
  const set1Bol = reduceSetNormale(partita, setKeys.slice(0, 4), true);
  const set2Bol = reduceSetCorto(partita, setKeys.slice(4, 5), true);
  const set1Avv = reduceSetNormale(partita, setKeys.slice(0, 4), false);
  const set2Avv = reduceSetCorto(partita, setKeys.slice(4, 5), false);
  partita.setKeys = setKeys;
  partita.setBol = set1Bol + set2Bol;
  partita.setAvv = set1Avv + set2Avv;
  return <UI partita={partita} />;
}

function UI(props) {
  return (
    <table className="punteggio punteggio-esteso femm">
      <thead></thead>
      <tbody>
        <tr>
          <td>{props.partita.nomeBol}</td>
          <Set bol partita={props.partita} />
        </tr>
        <tr>
          <td>{props.partita.nomeAvv}</td>
          <Set partita={props.partita} />
        </tr>
      </tbody>
    </table>
  );
}

function Set(props) {
  const set = props.bol ? props.partita.setBol : props.partita.setAvv;
  return (
    <>
      <td>{set}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          const point = props.partita[props.partita.setKeys[i]];
          return (
            <td key={i}>{point ? point.split("-")[props.bol ? 0 : 1] : ""}</td>
          );
        })}
    </>
  );
}

function reduceSetNormale(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    if (bol) {
      var punti1 = punti[0];
      var punti2 = punti[1];
    } else {
      var punti1 = punti[1];
      var punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 25 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

function reduceSetCorto(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    if (bol) {
      var punti1 = punti[0];
      var punti2 = punti[1];
    } else {
      var punti1 = punti[1];
      var punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 15 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

export default Punteggio;
