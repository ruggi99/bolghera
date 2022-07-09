import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { PARTITE_BOLGHERA } from "lib/const";
import { reduceSetCorto, reduceSetNormale } from "lib/helpers";
import supabase from "lib/supabaseClient";

export default function Fusion() {
  const router = useRouter();
  var [partita, setPartita] = useState({});
  var [, setTmp] = useState(0); // Force update
  var forceUpdate = () => setTmp((v) => v + 1);
  useEffect(() => {
    if (!router.isReady) return;
    async function fetchData() {
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
  }, [router.isReady, router.query]);
  partita = { ...partita };
  const setKeys = Object.keys(partita).filter((k) => k.startsWith("set"));
  const set1Bol = reduceSetNormale(partita, setKeys.slice(0, 4), true);
  const set2Bol = reduceSetCorto(partita, setKeys.slice(4, 5), true);
  const set1Avv = reduceSetNormale(partita, setKeys.slice(0, 4), false);
  const set2Avv = reduceSetCorto(partita, setKeys.slice(4, 5), false);
  partita.setKeys = setKeys;
  partita.setBol = set1Bol + set2Bol;
  partita.setAvv = set1Avv + set2Avv;
  return <UI partita={partita} forceUpdate={forceUpdate} />;
}

function UI(props) {
  return (
    <table
      className={`punteggio punteggio-corto femm ${calc_set_match_point(
        props
      )}`}
    >
      <thead />
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

function getLastPoints(obj, bol) {
  const lastKey = obj.setKeys[obj.setBol + obj.setAvv];
  if (!lastKey) return "0";
  return obj[lastKey].split("-")[bol ? 0 : 1];
}

function Set(props) {
  const set = props.bol ? props.partita.setBol : props.partita.setAvv;
  return (
    <>
      <td>{set}</td>
      <td>{getLastPoints(props.partita, props.bol)}</td>
    </>
  );
}

function calc_set_match_point(props) {
  const { partita } = props;
  if (!partita.set1) return "";
  const pointsCurrentSetBol = getLastPoints(partita, true);
  const pointsCurrentSetAvv = getLastPoints(partita, false);
  const currentSet = partita.setBol + partita.setAvv + 1;

  const isSetPointCasa =
    pointsCurrentSetBol - pointsCurrentSetAvv >= 1 &&
    pointsCurrentSetBol >= (currentSet != 5 ? 24 : 14);
  const isMatchPointCasa = isSetPointCasa && partita.setBol == 2;

  const isSetPointOspiti =
    pointsCurrentSetAvv - pointsCurrentSetBol >= 1 &&
    pointsCurrentSetAvv >= (currentSet != 5 ? 24 : 14);
  const isMatchPointOspiti = isSetPointOspiti && partita.setAvv == 2;

  const classes = [];
  if (isMatchPointCasa || isMatchPointOspiti) {
    classes.push("matchpoint");
  } else if (isSetPointCasa || isSetPointOspiti) {
    classes.push("setpoint");
  }

  if (isMatchPointCasa || isSetPointCasa) {
    classes.push("sopra");
  }
  if (isMatchPointOspiti || isSetPointOspiti) {
    classes.push("sotto");
  }

  return classes.join(" ");
}
