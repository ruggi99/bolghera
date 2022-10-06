export function reduceSetNormale(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    var punti1, punti2;
    if (bol) {
      punti1 = punti[0];
      punti2 = punti[1];
    } else {
      punti1 = punti[1];
      punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 25 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

export function reduceSetCorto(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    var punti1, punti2;
    if (bol) {
      punti1 = punti[0];
      punti2 = punti[1];
    } else {
      punti1 = punti[1];
      punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 15 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

export function throwIfNotOk(r) {
  if (!r.ok) throw r;
  return r;
}

export async function fetcher(...args) {
  return fetch(...args)
    .then(throwIfNotOk)
    .then((r) => r.json());
}
