export default function handler(req, res) {
  if (req.method != "GET") {
    res.status(404).end();
    return;
  }
  if (/[^a-zA-Z0-9?_/=&]/.test(req.url)) {
    res.status(401).end();
    return;
  }
  return fetch("https://srv4.matchshare.it" + req.url.substring(8))
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
