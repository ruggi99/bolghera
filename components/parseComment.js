export default function parseComment(data) {
  if (!data) return null;
  const commento = data.note.Commento.split(";");
  const inverti = commento[0] && commento[0] != "no comments";
  var nomeCasa, nomeOspiti;
  var liberoCasa, liberoOspiti;
  if (commento[2] && commento[2] != "no comments") {
    let commento2 = commento[2].split(",");
    nomeCasa = commento2[0];
    liberoCasa = commento2.length >= 2 && commento2[1];
  } else {
    nomeCasa = data.note.SqInDesC;
  }
  if (commento[3] && commento[3] != "no comments") {
    let commento2 = commento[3].split(",");
    nomeOspiti = commento2[0];
    liberoOspiti = commento2.length >= 2 && commento2[1];
  } else {
    nomeOspiti = data.note.SqOsDesC;
  }
  return { nomeCasa, nomeOspiti, liberoCasa, liberoOspiti, inverti };
}
