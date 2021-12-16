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
    <table
      className={`punteggio punteggio-corto masc ${calc_set_match_point(
        props.data
      )}`}
    >
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

function calc_set_match_point(data) {
  if (!data) return "";
  const note = data.note;
  var inverti = (note.Commento.split(";") || [])[0];
  inverti = inverti && inverti != "no comments";
  // Casa - Ospiti riferiti al DataVolley
  const isSetPointCasa =
    note.PT0 - note.PT1 >= 1 && note.PT0 >= (note.setAgg != 5 ? 24 : 14);
  const isMatchPointCasa = isSetPointCasa && note.SE0 == 2;

  const isSetPointOspiti =
    note.PT1 - note.PT0 >= 1 && note.PT1 >= (note.setAgg != 5 ? 24 : 14);
  const isMatchPointOspiti = isSetPointOspiti && note.SE1 == 2;

  const classes = [];
  if (isMatchPointCasa || isMatchPointOspiti) {
    classes.push("matchpoint");
  } else if (isSetPointCasa || isSetPointOspiti) {
    classes.push("setpoint");
  }
  if (inverti) {
    if (isMatchPointCasa || isSetPointCasa) {
      classes.push("sotto");
    }
    if (isMatchPointOspiti || isSetPointOspiti) {
      classes.push("sopra");
    }
  } else {
    if (isMatchPointCasa || isSetPointCasa) {
      classes.push("sopra");
    }
    if (isMatchPointOspiti || isSetPointOspiti) {
      classes.push("sotto");
    }
  }
  return classes.join(" ");
}

export default Punteggio;
