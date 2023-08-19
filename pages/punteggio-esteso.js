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
      <td>{data.note.SE0 || 0}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          var score = note[`Set${i + 1}PP4`];
          if (!score) {
            if (i == 0) {
              return <td key={0}>0</td>;
            } else {
              return <td key={0} />;
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

function RigaAvversari({ data, nomeOspiti }) {
  const note = data.note;
  return (
    <tr>
      <td>{nomeOspiti}</td>
      <td>{data.note.SE1 || 0}</td>
      {Array(5)
        .fill()
        .map((v, i) => {
          var score = note[`Set${i + 1}PP4`];
          if (!score) {
            if (i == 0) {
              return <td key={0}>0</td>;
            } else {
              return <td key={0} />;
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

function UI({ data, inverti, nomeCasa, nomeOspiti }) {
  if (!data) return null;
  return (
    <table className="punteggio punteggio-esteso masc">
      <thead />
      <tbody>
        {inverti ? (
          <>
            <RigaAvversari data={data} nomeOspiti={nomeOspiti} />
            <RigaBolghera data={data} nomeCasa={nomeCasa} />
          </>
        ) : (
          <>
            <RigaBolghera data={data} nomeCasa={nomeCasa} />
            <RigaAvversari data={data} nomeOspiti={nomeOspiti} />
          </>
        )}
      </tbody>
    </table>
  );
}

export default Punteggio;
