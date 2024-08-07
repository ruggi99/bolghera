import { useCallback, useEffect, useState } from "react";

import {
  Block,
  Box,
  Button,
  Container,
  Content,
  Form,
  Heading,
  Hero,
  Section,
  Tag,
} from "react-bulma-components";

import CustomModal from "components/CustomModal";
import { AUTORIZZATI, PARTITE_BOLGHERA } from "lib/const";
import { reduceSetCorto, reduceSetNormale } from "lib/helpers";
import useUser from "lib/hooks/useUser";
import supabase from "lib/supabaseClient";

export default function Fusion() {
  const [partite, setPartite] = useState(null);
  const [autorizzato, setAutorizzato] = useState(false);
  const user = useUser(supabase);
  const [, setTmp] = useState(0);
  const forceUpdate = () => setTmp((v) => v + 1);
  const updateSet = useCallback((id, colonna, valore) => {
    const obj = { [colonna]: valore };
    supabase
      .from(PARTITE_BOLGHERA)
      .update(obj)
      .eq("id", id)
      .then(() =>
        setPartite((s) => s.map((v) => (v.id == id ? { ...v, ...obj } : v)))
      );
  }, []);
  useEffect(() => {
    function fetchData() {
      supabase
        .from(PARTITE_BOLGHERA)
        .select("*")
        .order("id", { ascending: false })
        .then((r) => setPartite(r.data))
        .catch(() => setPartite(false));
    }
    supabase
      .channel("public:" + PARTITE_BOLGHERA)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: PARTITE_BOLGHERA },
        (r) =>
          setPartite((s) => {
            return s.some((v) => v.id == r.new.id) ? s : [r.new, ...s];
          })
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: PARTITE_BOLGHERA },
        (r) => setPartite((s) => s.map((v) => (v.id == r.new.id ? r.new : v)))
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: PARTITE_BOLGHERA },
        (r) => setPartite((s) => s.filter((v) => v.id != r.old.id))
      )
      .subscribe((status, error) => {
        console.log(status, error);
        if (status == "SUBSCRIBED") {
          console.log("subscribe ok");
          fetchData();
        }
      });
  }, []);
  useEffect(() => {
    if (user) {
      supabase
        .from(AUTORIZZATI)
        .select("*")
        .single()
        .then((r) => setAutorizzato(r.data.autorizzato));
    } else {
      setAutorizzato(false);
    }
  }, [user]);
  return (
    <UI
      partite={partite}
      updateSet={updateSet}
      user={user}
      autorizzato={autorizzato}
      forceUpdate={forceUpdate}
    />
  );
}

function UI({ autorizzato, partite, updateSet, user }) {
  const [modal, setModal] = useState("");
  const signOut = () => supabase.auth.signOut();
  return (
    <>
      <Hero color="bolghera" gradient renderAs="div">
        <Hero.Body>
          {user && (
            <>
              <Heading>Utente {user.email}</Heading>
              <Heading subtitle>
                {autorizzato ? "Sei" : "Non sei"} autorizzato
              </Heading>
            </>
          )}
          <Button.Group>
            {user ? (
              <Button onClick={signOut} color="bolghera" inverted>
                Log Out
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setModal("login")}
                  color="bolghera"
                  inverted
                >
                  Login
                </Button>
                <Button
                  onClick={() => setModal("sign")}
                  color="bolghera"
                  inverted
                >
                  Iscriviti
                </Button>
              </>
            )}
            {autorizzato && (
              <Button onClick={() => setModal("add")} color="bolghera" inverted>
                Aggiungi Partita...
              </Button>
            )}
          </Button.Group>
        </Hero.Body>
      </Hero>
      <Section>
        <Container>
          <Content>
            <ModalAggiunta show={modal == "add"} onClose={() => setModal("")} />
            <ModalSignIn
              show={modal == "login" || modal == "sign"}
              onClose={() => setModal("")}
              isLogin={modal == "login"}
            />
            <ModalElimina
              show={modal.startsWith("delete")}
              onClose={() => setModal("")}
              daEliminare={modal.substring(7)}
            />
            <Partite
              partite={partite}
              eliminaPartita={(id) => setModal("delete-" + id)}
              updateSet={updateSet}
              autorizzato={autorizzato}
            />
          </Content>
        </Container>
      </Section>
    </>
  );
}

function ModalAggiunta({ onClose, show }) {
  const aggiungiPartita = () =>
    supabase
      .from(PARTITE_BOLGHERA)
      .insert({ nomeBol: nomeBol, nomeAvv: nomeAvv, camp: camp })
      .then(onClose);
  var [camp, setCamp] = useState("");
  var [nomeBol, setNomeBol] = useState("");
  var [nomeAvv, setNomeAvv] = useState("");
  return (
    <CustomModal
      show={show}
      title="Aggiungi nuova partita"
      onClose={onClose}
      buttons={
        <>
          <Button onClick={aggiungiPartita} color="success">
            Aggiungi
          </Button>
          <Button onClick={onClose}>Annulla</Button>
        </>
      }
    >
      <Form.Field>
        <Form.Label htmlFor="3">Campionato</Form.Label>
        <Form.Control>
          <Form.Input
            id="3"
            value={camp}
            onChange={(e) => setCamp(e.target.value)}
          />
        </Form.Control>
      </Form.Field>
      <Form.Field>
        <Form.Label htmlFor="1">Nome Squadra 1 (Casa)</Form.Label>
        <Form.Control>
          <Form.Input
            id="1"
            value={nomeBol}
            onChange={(e) => setNomeBol(e.target.value)}
          />
        </Form.Control>
      </Form.Field>
      <Form.Field>
        <Form.Label htmlFor="2">Nome Squadra 2 (Ospite)</Form.Label>
        <Form.Control>
          <Form.Input
            id="2"
            value={nomeAvv}
            onChange={(e) => setNomeAvv(e.target.value)}
          />
        </Form.Control>
      </Form.Field>
    </CustomModal>
  );
}

function ModalSignIn({ isLogin, onClose, show }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const handleModal = () => {
    setError(false);
    if (isLogin) {
      supabase.auth
        .signInWithPassword({ email: email, password: password })
        .then((d) => {
          if (d.error) throw d.error;
          setError(false);
          onClose();
        })
        .catch(() => setError(true));
    } else {
      supabase.auth
        .signUp({ email: email, password: password })
        .then((d) => {
          if (d.error) throw d.error;
          setError(false);
          onClose();
        })
        .catch(() => setError(true));
    }
  };
  return (
    <CustomModal
      show={show}
      title={isLogin ? "Accedi" : "Iscriviti"}
      onClose={onClose}
      buttons={
        <>
          <Button onClick={handleModal} color="success">
            {isLogin ? "Login" : "Iscriviti"}
          </Button>
          <Button onClick={onClose}>Annulla</Button>
        </>
      }
    >
      <Form.Field>
        <Form.Label htmlFor="1">Email</Form.Label>
        <Form.Control>
          <Form.Input
            id="1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Control>
      </Form.Field>
      <Form.Field>
        <Form.Label htmlFor="2">Password</Form.Label>
        <Form.Control>
          <Form.Input
            id="2"
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Control>
      </Form.Field>
      {error && (
        <p style={{ color: "red" }}>Ci sono stati degli errori. Riprova</p>
      )}
    </CustomModal>
  );
}

function ModalElimina({ daEliminare, onClose, show }) {
  var eliminaPartita = (id) =>
    supabase.from(PARTITE_BOLGHERA).delete().eq("id", id).then();
  return (
    <CustomModal
      show={show}
      title="Elimina Partita"
      onClose={onClose}
      buttons={
        <>
          <Button
            onClick={() => {
              eliminaPartita(daEliminare);
              onClose();
            }}
            color="danger"
          >
            Elimina
          </Button>
          <Button onClick={onClose}>Annulla</Button>
        </>
      }
    >
      <div>Vuoi eliminare la partita?</div>
    </CustomModal>
  );
}

function Partite({ partite, ...props }) {
  if (partite === null) {
    return <div>Caricamento</div>;
  } else if (partite === false) {
    return <div>Errore</div>;
  } else if (partite?.length === 0) {
    return <div>Nessuna partita</div>;
  }
  return partite.map((v) => <Partita key={v.id} partita={v} {...props} />);
}

function Partita({ autorizzato, eliminaPartita, partita, updateSet }) {
  const setKeys = Object.keys(partita).filter((k) => k.startsWith("set"));
  const setLeft =
    reduceSetNormale(partita, setKeys.slice(0, 4), true) +
    reduceSetCorto(partita, setKeys.slice(4, 5), true);
  const setRight =
    reduceSetNormale(partita, setKeys.slice(0, 4), false) +
    reduceSetCorto(partita, setKeys.slice(4, 5), false);
  const bolgheraSide = partita.nomeBol.includes("Bolghera")
    ? "left"
    : partita.nomeAvv.includes("Bolghera")
    ? "right"
    : "none";
  const modificaSet = (set, up, leftSide) => {
    var punti = partita[set].split("-");
    punti = punti.map((p) => parseInt(p));
    if (leftSide) {
      if (!up && !punti[0]) return;
      punti[0] = punti[0] + (up ? 1 : -1);
    } else {
      if (!up && !punti[1]) return;
      punti[1] = punti[1] + (up ? 1 : -1);
    }
    punti = punti.join("-");
    updateSet(partita.id, set, punti);
  };
  return (
    <Box className="partita">
      <Block
        display="flex"
        alignItems="center"
        textSize="3"
        className="titolo"
        flexWrap="wrap"
      >
        <Tag size="large" className="campionato">
          {partita.camp}
        </Tag>
        <div style={{ marginRight: "1rem" }}>{partita.nomeBol}</div>
        <Tag
          size="large"
          color={getResultTagColor(setLeft, setRight, bolgheraSide)}
          className="has-text-white"
          mr="4"
        >
          {setLeft} - {setRight}
        </Tag>
        <div>{partita.nomeAvv}</div>
        {autorizzato && (
          <Tag size="small" id="id">
            Id: {partita.id}
          </Tag>
        )}
      </Block>
      <Block>
        {setKeys
          .filter((s, i) => {
            var totalSet = setLeft + setRight;
            if (setLeft == 3 || setRight == 3) {
              totalSet--;
            }
            if (i <= totalSet) {
              return true;
            }
          })
          .map((v) => (
            <Set
              key={v}
              set={v}
              value={partita[v]}
              modificaSet={modificaSet}
              autorizzato={autorizzato}
            />
          ))}
      </Block>
      {autorizzato && (
        <Button onClick={() => eliminaPartita(partita.id)}>
          Elimina Partita...
        </Button>
      )}
    </Box>
  );
}

function getResultTagColor(setLeft, setRight, bolgheraSide) {
  if (bolgheraSide == "none") return "";
  if (setLeft == 3) {
    if (bolgheraSide == "left") return "success";
    return "danger";
  } else if (setRight == 3) {
    if (bolgheraSide == "left") return "danger";
    return "success";
  } else return "";
}

function Set({ autorizzato, modificaSet, set, value }) {
  return (
    <Block>
      <Heading renderAs="h3" subtitle>
        Set {set[3]}: {value}
      </Heading>
      {autorizzato && (
        <Button.Group>
          <Button size="medium" onClick={() => modificaSet(set, false, true)}>
            -
          </Button>
          <Button size="medium" onClick={() => modificaSet(set, true, true)}>
            +
          </Button>
          <Button size="medium" onClick={() => modificaSet(set, false, false)}>
            -
          </Button>
          <Button size="medium" onClick={() => modificaSet(set, true, false)}>
            +
          </Button>
        </Button.Group>
      )}
    </Block>
  );
}
