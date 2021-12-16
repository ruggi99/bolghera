import React from "react";
import useWebsocket from "../components/websocket.js";
import parseComment from "../components/parseComment.js";

function Punteggio() {
  const data = useWebsocket();
  const data2 = parseComment(data);
  console.log(data);
  console.log(data2);
  return <UI data={data} {...data2} />;
}

function RigaBolghera(props) {
  const note = props.data.note;
  return (
    <tr>
      <td>{props.nomeCasa}</td>
      <td>{note.SE0 || 0}</td>
      <td>{note.PT0 || 0}</td>
      <td>{note.FB ? null : <Ball />}</td>
    </tr>
  );
}

function RigaAvversari(props) {
  const note = props.data.note;
  return (
    <tr>
      <td>{props.nomeOspiti}</td>
      <td>{note.SE1 || 0}</td>
      <td>{note.PT1 || 0}</td>
      <td>{note.FB ? <Ball /> : null}</td>
    </tr>
  );
}

function UI(props) {
  if (!props.data || !props.data.note) return null;
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <table className="punteggio punteggio-corto masc">
      <thead></thead>
      <tbody>
        {commento[0] ? (
          <>
            <RigaAvversari {...props} />
            <RigaBolghera {...props} />
          </>
        ) : (
          <>
            <RigaBolghera {...props} />
            <RigaAvversari {...props} />
          </>
        )}
      </tbody>
    </table>
  );
}

function Ball() {
  return <img src="/v300.png" alt="" />;
}

export default Punteggio;
