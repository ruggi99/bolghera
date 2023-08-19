import { useRouter } from "next/router";

import useData from "components/useData";
import supabase from "lib/supabaseClient";

export default function UI() {
  const router = useRouter();
  const partita = useData(supabase, router.isReady && router.query.id);
  if (!partita) {
    return null;
  }
  return (
    <table
      className={`punteggio punteggio-corto masc ${calc_set_match_point(
        partita
      )}`}
    >
      <thead />
      <tbody>
        <tr>
          <td>{partita.nomeBol}</td>
          <Set bol partita={partita} />
        </tr>
        <tr>
          <td>{partita.nomeAvv}</td>
          <Set partita={partita} />
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

function Set({ bol, partita }) {
  const set = bol ? partita.setBol : partita.setAvv;
  return (
    <>
      <td>{set}</td>
      <td>{getLastPoints(partita, bol)}</td>
    </>
  );
}

function calc_set_match_point(partita) {
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
