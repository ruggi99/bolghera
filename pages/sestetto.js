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
        <div className="nome-squadra">{props.nomeCasa}</div>
        <Quadrato bolghera data={props.data} />
      </div>
      <div style={{ marginRight: "30px" }}>
        <Allenatore bolghera data={props.data} />
        <Libero bolghera data={props.data} libero />
      </div>
      <div style={{ marginLeft: "30px" }}>
        <Allenatore data={props.data} />
        <Libero data={props.data} libero />
      </div>
      <div style={{ marginRight: "30px" }}>
        <div className="nome-squadra">{props.nomeOspiti}</div>
        <Quadrato data={props.data} />
      </div>
    </div>
  );
}

function Quadrato(props) {
  return (
    <div className={"quadrato " + (props.bolghera ? "bolghera" : "")}>
      <TreMetri data={props.data} bolghera={props.bolghera} />
      <SeiMetri data={props.data} bolghera={props.bolghera} />
    </div>
  );
}

function TreMetri(props) {
  return (
    <div className="tre-metri">
      <Persona data={props.data} n="4" bolghera={props.bolghera} />
      <Persona data={props.data} n="3" bolghera={props.bolghera} />
      <Persona data={props.data} n="2" bolghera={props.bolghera} />
    </div>
  );
}

function SeiMetri(props) {
  return (
    <div className="sei-metri">
      <Persona data={props.data} n="5" bolghera={props.bolghera} />
      <Persona data={props.data} n="6" bolghera={props.bolghera} />
      <Persona data={props.data} n="1" bolghera={props.bolghera} />
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
  return (
    <div className={"persona " + (NPall == props.n ? "pall" : "")}>
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
