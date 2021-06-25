import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const PARTITE_BOLGHERA = "partite_bolghera";

const supabase = createClient(
  "https://ytazfaaqthtbogrdthjf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzMyODQ2MywiZXhwIjoxOTM4OTA0NDYzfQ.qERtQfqDfQF7_ekIPvmfa7YBXswXGOEfQCz0qcUQOp8"
);

export default function Fusion() {
  var [partita, setPartita] = useState({});
  var [tmp, setTmp] = useState(0); // Force update
  var forceUpdate = () => setTmp((v) => v + 1);
  useEffect(() => {
    supabase
      .from(PARTITE_BOLGHERA)
      .select("*")
      .order("id", { ascending: false })
      .single()
      .then((r) => setPartita(r.data));
    supabase
      .from(PARTITE_BOLGHERA)
      .on("UPDATE", (r) => setPartita(r.new))
      .subscribe();
  }, []);
  return <UI partita={partita} forceUpdate={forceUpdate} />;
}

function UI(props) {
  return (
    <table className="overlay">
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

function getLastPoints(obj, keys, bol) {
  const lastKey = keys.filter((s) => obj[s] != "0-0").slice(-1, 5)[0];
  console.log(lastKey);
  if (!lastKey) return;
  console.log(obj[lastKey].split("-"));
  return obj[lastKey].split("-")[bol ? 0 : 1];
}

function Set(props) {
  var setKeys = Object.keys(props.partita).filter((k) => k.startsWith("set"));
  const set1 = reduceSetNormale(props.partita, setKeys.slice(0, 4), props.bol);
  const set2 = reduceSetCorto(props.partita, setKeys.slice(4, 5), props.bol);
  const set = set1 + set2;
  return (
    <>
      <td>{set}</td>
      <td>{getLastPoints(props.partita, setKeys, props.bol)}</td>
    </>
  );
}
