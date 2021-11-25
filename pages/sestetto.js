import React from "react";
import useWebsocket from "../components/websocket.js";
import parseComment from "../components/parseComment.js";

function Sestetto(props) {
  const data = useWebsocket();
  const data2 = parseComment(data);
  console.log(data);
  console.log(data2);
  return <UI data={data} {...data2} />;
}

function UI(props) {
  if (!props.data || !props.data.elenco || !props.data.note) return null;
  const note = props.data.note;
  const commento = note.Commento?.split(";") || [];
  return (
    <div className="sestetto">
      <div style={{ marginLeft: "30px" }}>
        <div className="nome-squadra">{note.SqInDesC}</div>
        <Quadrato bolghera {...props} />
      </div>
      <div style={{ marginRight: "30px" }}>
        <Allenatore bolghera {...props} />
        <Libero bolghera {...props} libero />
      </div>
      <div style={{ marginLeft: "30px" }}>
        <Allenatore {...props} />
        <Libero {...props} libero />
      </div>
      <div style={{ marginRight: "30px" }}>
        <div className="nome-squadra">{note.SqOsDesC}</div>
        <Quadrato {...props} />
      </div>
    </div>
  );
}

function Quadrato(props) {
  return (
    <div className={"quadrato " + (props.bolghera ? "bolghera" : "")}>
      <TreMetri {...props} bolghera={props.bolghera} />
      <SeiMetri {...props} bolghera={props.bolghera} />
    </div>
  );
}

function TreMetri(props) {
  return (
    <div className="tre-metri">
      <Persona {...props} n="4" bolghera={props.bolghera} />
      <Persona {...props} n="3" bolghera={props.bolghera} />
      <Persona {...props} n="2" bolghera={props.bolghera} />
    </div>
  );
}

function SeiMetri(props) {
  return (
    <div className="sei-metri">
      <Persona {...props} n="5" bolghera={props.bolghera} />
      <Persona {...props} n="6" bolghera={props.bolghera} />
      <Persona {...props} n="1" bolghera={props.bolghera} />
    </div>
  );
}

function Persona(props) {
  const { bolghera, data } = props;
  if (!data.note.RotUltima) {
    return null;
  }
  const giocatore = data.elenco
    .filter((p) => p.CodSq == (bolghera ? "0" : "1"))
    .find(
      (p) =>
        p.Pet ==
        data.note.RotUltima.substr(
          (bolghera ? 0 : 12) + (Number(props.n) - 1) * 2,
          2
        ).trim()
    );
  const NPall = data.note[bolghera ? "ZPagg0" : "ZPagg1"];
  const classes = ["persona"];
  if (NPall == props.n) {
    classes.push("pall");
  }
  return (
    <div className={classes.join(" ")}>
      <div className="numero">{giocatore.Pet}</div>
      <div className="cognome">{capitalize(giocatore.Cognome)}</div>
    </div>
  );
}

function Allenatore(props) {
  const { bolghera, data } = props;
  const allenatore = data.note[bolghera ? "AlleIn" : "AlleOs"];
  return (
    <div className="allenatore">
      <div className="all">All.</div>
      <div className="cognome">{capitalize(allenatore.split(" ")[0])}</div>
      <div className="nome">{capitalize(allenatore.split(" ")[1])}</div>
    </div>
  );
}

function Libero(props) {
  const { bolghera, data } = props;
  var giocatore;
  if (bolghera && props.liberoCasa) {
    giocatore = data.elenco
      .filter((p) => p.CodSq == (bolghera ? "0" : "1"))
      .find((p) => p.Pet == props.liberoCasa);
  } else if (!bolghera && props.liberoOspiti) {
    giocatore = data.elenco
      .filter((p) => p.CodSq == (bolghera ? "0" : "1"))
      .find((p) => p.Pet == props.liberoOspiti);
  } else {
    giocatore = data.elenco
      .filter((p) => p.CodSq == (bolghera ? "0" : "1"))
      .find((p) => p.IDRuolo == "1");
  }
  if (!giocatore) return null;
  return (
    <div className="libero">
      <div className="numero">{giocatore.Pet}</div>
      <div className="cognome">{capitalize(giocatore.Cognome)}</div>
    </div>
  );
}

function capitalize(str) {
  if (str.indexOf(" ") == -1)
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  str = str.split(" ");
  str = str.map((val) => capitalize(val));
  return str.join(" ");
}

export default Sestetto;
