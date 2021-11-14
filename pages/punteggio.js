import React from "react";
import useWebsocket from "../components/websocket.js";

function Punteggio() {
  const data = useWebsocket();
  console.log(data);
  return <UI data={data} />;
}

function RigaBolghera(props) {
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <tr>
      <td>{(commento[2] != "no comments" && commento[2]) || note.SqInDesC}</td>
      <td>{note.SE0 || 0}</td>
      <td>{note.PT0 || 0}</td>
      <td>{note.FB ? null : <Ball />}</td>
    </tr>
  );
}

function RigaAvversari(props) {
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <tr>
      <td>{(commento[3] != "no comments" && commento[3]) || note.SqOsDesC}</td>
      <td>{note.SE1 || 0}</td>
      <td>{note.PT1 || 0}</td>
      <td>{note.FB ? <Ball /> : null}</td>
    </tr>
  );
}

function UI(props) {
  if (!props.data || !props.data.elenco || !props.data.note) return null;
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <table className="punteggio punteggio-corto">
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
