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
import supabase from "lib/supabaseClient";

export default function Fusion() {
  const [partite, setPartite] = useState(null);
  const [autorizzato, setAutorizzato] = useState(false);
  const [, setTmp] = useState(0);
  const forceUpdate = () => setTmp((v) => v + 1);
  const user = supabase.auth.user();
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
    supabase
      .from(PARTITE_BOLGHERA)
      .select("*")
      .order("id", { ascending: false })
      .then((r) => setPartite(r.data))
      .catch(() => setPartite(false));
    supabase
      .from(PARTITE_BOLGHERA)
      .on("INSERT", (r) =>
        setPartite((s) => {
          return s.some((v) => v.id == r.new.id) ? s : [r.new, ...s];
        })
      )
      .on("UPDATE", (r) =>
        setPartite((s) => s.map((v) => (v.id == r.new.id ? r.new : v)))
      )
      .on("DELETE", (r) => setPartite((s) => s.filter((v) => v.id != r.old.id)))
      .subscribe();
    supabase.auth.onAuthStateChange(() => forceUpdate());
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

function UI(props) {
  const [modal, setModal] = useState("");
  const signOut = () => supabase.auth.signOut();
  return (
    <>
      <Hero color="bolghera" gradient renderAs="div">
        <Hero.Body>
          {props.user && (
            <>
              <Heading>Utente {props.user.email}</Heading>
              <Heading subtitle>
                {props.autorizzato ? "Sei" : "Non sei"} autorizzato
              </Heading>
            </>
          )}
          <Button.Group>
            {props.user ? (
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
            {props.autorizzato && (
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
              partite={props.partite}
              eliminaPartita={(id) => setModal("delete-" + id)}
              updateSet={props.updateSet}
              autorizzato={props.autorizzato}
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
        .signIn({ email: email, password: password })
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
  }
  return partite.map((v) => <Partita key={v.id} partita={v} {...props} />);
}

function Partita(props) {
  const { partita } = props;
  const setKeys = Object.keys(partita).filter((k) => k.startsWith("set"));
  const setLeft =
    reduceSetNormale(partita, setKeys.slice(0, 4), true) +
    reduceSetCorto(partita, setKeys.slice(4, 5), true);
  const setRight =
    reduceSetNormale(partita, setKeys.slice(0, 4), false) +
    reduceSetCorto(partita, setKeys.slice(4, 5), false);
  const bolgheraSide = partita.nomeBol.contains("Bolghera")
    ? "left"
    : partita.nomeAvv.contains("Bolghera")
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
    props.updateSet(partita.id, set, punti);
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
          mr="4"
        >
          {setLeft} - {setRight}
        </Tag>
        <div>{partita.nomeAvv}</div>
        {props.autorizzato && (
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
              autorizzato={props.autorizzato}
            />
          ))}
      </Block>
      {props.autorizzato && (
        <Button onClick={() => props.eliminaPartita(partita.id)}>
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

function Set(props) {
  return (
    <Block>
      <Heading renderAs="h3" subtitle>
        Set {props.set[3]}: {props.value}
      </Heading>
      {props.autorizzato && (
        <Button.Group>
          <Button
            size="medium"
            onClick={() => props.modificaSet(props.set, false, true)}
          >
            -
          </Button>
          <Button
            size="medium"
            onClick={() => props.modificaSet(props.set, true, true)}
          >
            +
          </Button>
          <Button
            size="medium"
            onClick={() => props.modificaSet(props.set, false, false)}
          >
            -
          </Button>
          <Button
            size="medium"
            onClick={() => props.modificaSet(props.set, true, false)}
          >
            +
          </Button>
        </Button.Group>
      )}
    </Block>
  );
}
