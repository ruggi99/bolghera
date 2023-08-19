import parseComment from "components/parseComment";
import useWebsocket from "components/websocket";

function Punteggio() {
  const data = useWebsocket();
  const data2 = parseComment(data);
  return <UI data={data} {...data2} />;
}

function RigaBolghera({ data, nomeCasa }) {
  const note = data.note;
  return (
    <tr>
      <td>{nomeCasa}</td>
      <td>{note.SE0 || 0}</td>
      <td>{note.PT0 || 0}</td>
      <td>{note.FB ? null : <Ball />}</td>
    </tr>
  );
}

function RigaAvversari({ data, nomeOspiti }) {
  const note = data.note;
  return (
    <tr>
      <td>{nomeOspiti}</td>
      <td>{note.SE1 || 0}</td>
      <td>{note.PT1 || 0}</td>
      <td>{note.FB ? <Ball /> : null}</td>
    </tr>
  );
}

function UI({ data, inverti, nomeCasa, nomeOspiti }) {
  if (!data || !data.note) return null;
  return (
    <table
      className={`punteggio punteggio-corto masc ${calc_set_match_point(data)}`}
    >
      <thead />
      <tbody>
        {inverti ? (
          <>
            <RigaAvversari data={data} nomeOspiti={nomeOspiti} />
            <RigaBolghera data={data} nomeCasa={nomeCasa} />
          </>
        ) : (
          <>
            <RigaBolghera nomeCasa={nomeCasa} />
            <RigaAvversari nomeOspiti={nomeOspiti} />
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
