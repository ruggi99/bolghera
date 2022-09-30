import useWebsocket from "../components/websocket.js";

function Roster() {
  const data = useWebsocket();
  return <UI data={data} />;
}

function UI(props) {
  if (!props.data || !props.data.elenco || !props.data.note) return null;
  const note = props.data.note;
  const elenco = props.data.elenco;
  const commento = note.Commento ? note.Commento.split(";") : [];
  return (
    <table className="roster">
      <thead>
        <tr>
          <th colSpan="2">
            {(commento[2] != "no comments" && commento[2]) || note.SqInDesC}
          </th>
          <th colSpan="2">
            {(commento[3] != "no comments" && commento[3]) || note.SqOsDesC}
          </th>
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
              <td>
                {capitalize(_casa.Cognome) +
                  " " +
                  _casa.Nome[0].toUpperCase() +
                  "."}
              </td>
            </>
          ) : (
            <td colSpan="2" />
          )}
          {_ospite ? (
            <>
              <td>{_ospite.Pet}</td>
              <td>
                {capitalize(_ospite.Cognome) +
                  " " +
                  _ospite.Nome[0].toUpperCase() +
                  "."}
              </td>
            </>
          ) : (
            <td colSpan="2" />
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
        <td>{capitalize(note.AlleIn)}</td>
        <td>1° All</td>
        <td>{capitalize(note.AlleOs)}</td>
      </tr>
      <tr>
        <td>2° All</td>
        <td>{capitalize(note.AssIn)}</td>
        <td>2° All</td>
        <td>{capitalize(note.AssOs)}</td>
      </tr>
    </>
  );
}

function capitalize(str) {
  if (str.indexOf(" ") == -1)
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  str = str.split(" ");
  str = str.map((val) => capitalize(val));
  return str.join(" ");
}

export default Roster;
