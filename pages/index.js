import React, { useState, useEffect } from "react";
import {
  Section,
  Container,
  Content,
  Box,
  Tag,
  Block,
  Button,
  Form,
  Hero,
  Heading,
} from "react-bulma-components";
import { createClient } from "@supabase/supabase-js";
import CustomModal from "../components/CustomModal";

const PARTITE_BOLGHERA = "partite_bolghera";
const AUTORIZZATI = "autorizzati";

const supabase = createClient(
  "https://ytazfaaqthtbogrdthjf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzMyODQ2MywiZXhwIjoxOTM4OTA0NDYzfQ.qERtQfqDfQF7_ekIPvmfa7YBXswXGOEfQCz0qcUQOp8"
);

export default function Fusion() {
  var [partite, setPartite] = useState([]);
  var [autorizzati, setAutorizzati] = useState([]);
  var [tmp, setTmp] = useState(0);
  var forceUpdate = () => setTmp((v) => v + 1);
  useEffect(() => {
    supabase
      .from(PARTITE_BOLGHERA)
      .select("*")
      .order("id", { ascending: false })
      .then((r) => setPartite(r.data));
    supabase
      .from(AUTORIZZATI)
      .select("*")
      .then((r) => setAutorizzati(r.data));
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
  }, []);
  var user = supabase.auth.user();
  var autorizzato = user && autorizzati.some((a) => a.id == user.id);
  return (
    <UI
      partite={partite}
      user={user}
      autorizzato={autorizzato}
      forceUpdate={forceUpdate}
    />
  );
}

function UI(props) {
  var [modalAggiunta, setModalAggiunta] = useState(false);
  var [modalSign, setModalSign] = useState(false);
  var [modalElimina, setModalElimina] = useState(false);
  var [camp, setCamp] = useState("");
  var [nomeBol, setNomeBol] = useState("Bolghera");
  var [nomeAvv, setNomeAvv] = useState("Ospiti");
  var [isLogin, setIsLogin] = useState(false);
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [daEliminare, setDaEliminare] = useState("");
  const aggiungiPartita = () => {
    supabase
      .from(PARTITE_BOLGHERA)
      .insert({ nomeBol: nomeBol, nomeAvv: nomeAvv, camp: camp })
      .then();
    setModalAggiunta(false);
  };
  const handleModal = async () => {
    if (isLogin) {
      await supabase.auth.signIn({ email: email, password: password });
    } else {
      await supabase.auth.signUp({ email: email, password: password });
    }
    setModalSign(false);
    props.forceUpdate();
  };
  var eliminaPartita = (id) =>
    supabase.from(PARTITE_BOLGHERA).delete().eq("id", id).then();
  var signOut = () => {
    supabase.auth.signOut();
    props.forceUpdate();
  };
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
                  onClick={() => {
                    setModalSign(true);
                    setIsLogin(true);
                  }}
                  color="bolghera"
                  inverted
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setModalSign(true);
                    setIsLogin(false);
                  }}
                  color="bolghera"
                  inverted
                >
                  Iscriviti
                </Button>
              </>
            )}
            {props.autorizzato && (
              <Button
                onClick={() => setModalAggiunta(true)}
                color="bolghera"
                inverted
              >
                Aggiungi Partita...
              </Button>
            )}
          </Button.Group>
        </Hero.Body>
      </Hero>
      <Section>
        <Container>
          <Content>
            <CustomModal
              show={modalAggiunta}
              title="Aggiungi nuova partita"
              onClose={() => setModalAggiunta(false)}
              buttons={
                <>
                  <Button onClick={aggiungiPartita} color="success">
                    Aggiungi
                  </Button>
                  <Button onClick={() => setModalAggiunta(false)}>
                    Annulla
                  </Button>
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
                  ></Form.Input>
                </Form.Control>
              </Form.Field>
              <Form.Field>
                <Form.Label htmlFor="1">Nome Bolghera</Form.Label>
                <Form.Control>
                  <Form.Input
                    id="1"
                    value={nomeBol}
                    onChange={(e) => setNomeBol(e.target.value)}
                  ></Form.Input>
                </Form.Control>
              </Form.Field>
              <Form.Field>
                <Form.Label htmlFor="2">Nome Ospiti</Form.Label>
                <Form.Control>
                  <Form.Input
                    id="2"
                    value={nomeAvv}
                    onChange={(e) => setNomeAvv(e.target.value)}
                  ></Form.Input>
                </Form.Control>
              </Form.Field>
            </CustomModal>
            <CustomModal
              show={modalSign}
              title={isLogin ? "Accedi" : "Iscriviti"}
              onClose={() => setModalSign(false)}
              buttons={
                <>
                  <Button onClick={handleModal} color="success">
                    {isLogin ? "Login" : "Iscriviti"}
                  </Button>
                  <Button onClick={() => setModalSign(false)}>Annulla</Button>
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
                  ></Form.Input>
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
                  ></Form.Input>
                </Form.Control>
              </Form.Field>
            </CustomModal>
            <CustomModal
              show={modalElimina}
              title="Elimina Partita"
              onClose={() => setModalElimina(false)}
              buttons={
                <>
                  <Button
                    onClick={() => {
                      eliminaPartita(daEliminare);
                      setModalElimina(false);
                    }}
                    color="danger"
                  >
                    {"Elimina"}
                  </Button>
                  <Button onClick={() => setModalElimina(false)}>
                    Annulla
                  </Button>
                </>
              }
            >
              <div>Vuoi eliminare la partita?</div>
            </CustomModal>
            {props.partite.map((v) => (
              <Partita
                key={v.id}
                partita={v}
                autorizzato={props.autorizzato}
                eliminaPartita={(id) => {
                  setDaEliminare(id);
                  setModalElimina(true);
                }}
              />
            ))}
          </Content>
        </Container>
      </Section>
    </>
  );
}

function reduceSetNormale(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    if (bol) {
      var punti1 = punti[0];
      var punti2 = punti[1];
    } else {
      var punti1 = punti[1];
      var punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 25 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

function reduceSetCorto(obj, keys, bol) {
  return keys.reduce((a, v) => {
    var punti = obj[v].split("-");
    if (bol) {
      var punti1 = punti[0];
      var punti2 = punti[1];
    } else {
      var punti1 = punti[1];
      var punti2 = punti[0];
    }
    punti1 = parseInt(punti1);
    punti2 = parseInt(punti2);
    if (punti1 < 15 || punti1 - punti2 < 2) {
      return a;
    }
    return a + 1;
  }, 0);
}

function Partita(props) {
  var { partita } = props;
  var setKeys = Object.keys(partita).filter((k) => k.startsWith("set"));
  var setBol =
    reduceSetNormale(partita, setKeys.slice(0, 4), true) +
    reduceSetCorto(partita, setKeys.slice(4, 5), true);
  var setAvv =
    reduceSetNormale(partita, setKeys.slice(0, 4), false) +
    reduceSetCorto(partita, setKeys.slice(4, 5), false);
  var modificaSet = (set, up, bol) => {
    var punti = partita[set].split("-");
    punti = punti.map((p) => parseInt(p));
    if (bol) {
      if (!up && !punti[0]) return;
      punti[0] = punti[0] + (up ? 1 : -1);
    } else {
      if (!up && !punti[1]) return;
      punti[1] = punti[1] + (up ? 1 : -1);
    }
    punti = punti.join("-");
    supabase
      .from(PARTITE_BOLGHERA)
      .update({ [set]: punti })
      .eq("id", partita.id)
      .then();
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
          color={setBol == 3 ? "success" : setAvv == 3 ? "danger" : ""}
          mr="4"
        >
          {setBol} - {setAvv}
        </Tag>
        <div>{partita.nomeAvv}</div>
      </Block>
      <Block>
        {setKeys
          .filter((s, i) => {
            if (i <= 2) return true;
            if (Math.min(setBol, setAvv) > i - 3) {
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
