import parseComment from "../components/parseComment.js";
import useWebsocket from "../components/websocket.js";

function Sestetto() {
  const data = useWebsocket();
  if (!data) return null;
  const data2 = parseComment(data);
  var { liberoCasa, liberoOspiti } = data2;
  if (!liberoCasa) {
    liberoCasa = data.elenco.filter(
      (p) => p.CodSq == "0" && p.IDRuolo == "1"
    )[0].Pet;
  }
  if (!liberoOspiti) {
    liberoOspiti = data.elenco.filter(
      (p) => p.CodSq == "1" && p.IDRuolo == "1"
    )[0].Pet;
  }
  data2["liberoCasa"] = liberoCasa;
  data2["liberoOspiti"] = liberoOspiti;
  return <UI data={data} {...data2} />;
}

function UI(props) {
  if (!props.data || !props.data.elenco || !props.data.note) return null;
  const note = props.data.note;
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
      <div className="riserve">
        <div style={{ marginLeft: "30px", width: "400px" }}>
          <Riserve {...props} bolghera />
        </div>
        <div style={{ marginRight: "30px", width: "120px" }} />
        <div style={{ marginLeft: "30px", width: "120px" }} />
        <div style={{ marginRight: "30px", width: "400px" }}>
          <Riserve {...props} />
        </div>
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
  if (giocatore.Id == "C") {
    classes.push("kappa");
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
  if (bolghera) {
    giocatore = data.elenco
      .filter((p) => p.CodSq == "0")
      .find((p) => p.Pet == props.liberoCasa);
  } else {
    giocatore = data.elenco
      .filter((p) => p.CodSq == "1")
      .find((p) => p.Pet == props.liberoOspiti);
  }
  if (!giocatore) return null;
  return (
    <div className="libero">
      <div className="numero">{giocatore.Pet}</div>
      <div className="cognome">{capitalize(giocatore.Cognome)}</div>
    </div>
  );
}

function Riserve(props) {
  const giocatori = props.data.elenco
    .filter((p) => p.CodSq == (props.bolghera ? "0" : "1"))
    .filter((p) => calc_riserva(p, props));
  const cognomi = giocatori.map((p) => capitalize(p.Cognome) + calc_cognome(p));
  return <div className="riserve-q">A disposizione: {cognomi.join(", ")}.</div>;
}

function calc_riserva(giocatore, props) {
  if (props.bolghera) {
    if (giocatore.Pet == props.liberoCasa) {
      return false;
    }
  } else {
    if (giocatore.Pet == props.liberoOspiti) {
      return false;
    }
  }
  const set = props.data.note.SetAgg;
  const set2 = giocatore["S" + set];
  return !set2 || !parseInt(set2);
}

function calc_cognome(giocatore) {
  var res = "";
  if (giocatore.Id == "C") res += " (K)";
  if (giocatore.Id == "L") res += " (L)";
  return res;
}

function capitalize(str) {
  if (str.indexOf(" ") == -1)
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  str = str.split(" ");
  str = str.map((val) => capitalize(val));
  return str.join(" ");
}

export default Sestetto;
