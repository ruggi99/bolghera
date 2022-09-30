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
