import React from "react";
import useWebsocket from "../components/websocket.js";
import parseComment from "../components/parseComment.js";

function Punteggio() {
  const data = useWebsocket();
  const data2 = parseComment(data);
  console.log(data);
  return <UI data={data} {...data2} />;
}

function RigaBolghera(props) {
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <tr>
      <td>
        {(commento[2] != "no comments" && commento[2]) ||
          props.data.note.SqInDesC}
      </td>
      <td>{props.data.note.SE0 || 0}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          var score = note[`Set${i + 1}PP4`];
          if (!score) {
            if (i == 0) {
              return <td>0</td>;
            } else {
              return <td />;
            }
          }
          score = score.split("-").map((v) => parseInt(v));
          const is_bold =
            score[0] >= (i == 4 ? 25 : 15) && score[0] - score[1] >= 2;
          return (
            <td key={i} style={is_bold ? { fontWeight: "bold" } : undefined}>
              {score[0]}
            </td>
          );
        })}
    </tr>
  );
}

function RigaAvversari(props) {
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <tr>
      <td>
        {(commento[3] != "no comments" && commento[3]) ||
          props.data.note.SqOsDesC}
      </td>
      <td>{props.data.note.SE1 || 0}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          var score = note[`Set${i + 1}PP4`];
          if (!score) {
            if (i == 0) {
              return <td>0</td>;
            } else {
              return <td />;
            }
          }
          score = score.split("-").map((v) => parseInt(v));
          const is_bold =
            score[1] >= (i == 4 ? 25 : 15) && score[1] - score[0] >= 2;
          return (
            <td key={i} style={is_bold ? { fontWeight: "bold" } : undefined}>
              {score[1]}
            </td>
          );
        })}
    </tr>
  );
}

function UI(props) {
  if (!props.data) return null;
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <table className="punteggio punteggio-esteso masc">
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

export default Punteggio;
