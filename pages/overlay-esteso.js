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
    <table className="punteggio punteggio-esteso masc">
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

function Set({ bol, partita }) {
  const set = bol ? partita.setBol : partita.setAvv;
  return (
    <>
      <td>{set}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          const point = partita[partita.setKeys[i]];
          return <td key={i}>{point ? point.split("-")[bol ? 0 : 1] : ""}</td>;
        })}
    </>
  );
}
