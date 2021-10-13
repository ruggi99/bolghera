import React from "react";
import useWebsocket from "../components/websocket.js";

function Roster(props) {
  const data = useWebsocket();
  console.log(data);
  return <UI data={data} />;
}

function UI(props) {
  if (!props.data || !props.data.elenco || !props.data.note) return null;
  const note = props.data.note;
  const elenco = props.data.elenco;
  const commento = note.Commento.split(";");
  const last_points = props.data.last_points;
  return (
    <table className="roster">
      <thead>
        <tr>
          <th colSpan="2">{note.SqInDesC}</th>
          <th colSpan="2">{note.SqOsDesC}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="4">&nbsp;</td>
        </tr>
        <Giocatori elenco={elenco} />
        <tr>
          <td colSpan="4">&nbsp;</td>
        </tr>
        <Staff note={note} />
      </tbody>
    </table>
  );
}

function Giocatori({ elenco }) {
  const casa = elenco.filter((p) => p.CodSq == "0");
  const ospiti = elenco.filter((p) => p.CodSq == "1");
  return Array(Math.max(casa.length, ospiti.length))
    .fill()
    .map((p, i) => {
      const _casa = casa[i];
      const _ospite = ospiti[i];
      return (
        <tr key={i}>
          {_casa ? (
            <>
              <td>{_casa.Pet}</td>
              <td>{_casa.Cognome + " " + _casa.Nome[0] + "."}</td>
            </>
          ) : (
            <td colSpan="2"></td>
          )}
          {_ospite ? (
            <>
              <td>{_ospite.Pet}</td>
              <td>{_ospite.Cognome + " " + _ospite.Nome[0] + "."}</td>
            </>
          ) : (
            <td colSpan="2"></td>
          )}
        </tr>
      );
    });
}

function Staff({ note }) {
  return (
    <>
      <tr>
        <td>1° All</td>
        <td>{note.AlleIn}</td>
        <td>1° All</td>
        <td>{note.AlleOs}</td>
      </tr>
      <tr>
        <td>2° All</td>
        <td>{note.AssIn}</td>
        <td>2° All</td>
        <td>{note.AssOs}</td>
      </tr>
    </>
  );
}

export default Roster;
