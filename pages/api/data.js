export default async function handler(req, res) {
  if (req.method != "GET") {
    res.status(404).end();
    return;
  }
  return fetch("https://ruggi.altervista.org/Bolghera/data.json")
    .then((r) => {
      if (r.ok) return r.json();
      throw r;
    })
    .then((d) => res.status(200).json(d))
    .catch((e) => {
      console.error(e);
      res.status(500).end();
    });
}
