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
  return <UI partite={partite} user={user} autorizzato={autorizzato} />;
}

function UI(props) {
  var [modalAggiunta, setModalAggiunta] = useState(false);
  var [modalSign, setModalSign] = useState(false);
  var [nomeBol, setNomeBol] = useState("Bolghera");
  var [nomeAvv, setNomeAvv] = useState("Ospiti");
  var [isLogin, setIsLogin] = useState(false);
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  const aggiungiPartita = () => {
    supabase
      .from(PARTITE_BOLGHERA)
      .insert({ nomeBol: nomeBol, nomeAvv: nomeAvv })
      .then();
    setModalSign(false);
  };
  const handleModal = async () => {
    if (isLogin) {
      await supabase.auth.signIn({ email: email, password: password });
    } else {
      await supabase.auth.signUp({ email: email, password: password });
    }
    setModalSign(false);
  };
  return (
    <>
      {props.user && (
        <Hero color="success" renderAs="div">
          <Hero.Body>
            <Heading>Utente {props.user.email}</Heading>
            <Heading subtitle>
              {props.autorizzato ? "Sei" : "Non sei"} autorizzato
            </Heading>
          </Hero.Body>
        </Hero>
      )}
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
            {props.partite.map((v) => (
              <Partita key={v.id} partita={v} autorizzato={props.autorizzato} />
            ))}
            <Button.Group>
              {props.autorizzato && (
                <Button onClick={() => setModalAggiunta(true)}>
                  Aggiungi Partita
                </Button>
              )}
              <Button
                onClick={() => {
                  setModalSign(true);
                  setIsLogin(true);
                }}
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setModalSign(true);
                  setIsLogin(false);
                }}
              >
                Iscriviti
              </Button>
            </Button.Group>
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
  var eliminaPartita = () =>
    supabase.from(PARTITE_BOLGHERA).delete().eq("id", partita.id).then();
  return (
    <Box className="partita">
      <Block
        display="flex"
        alignItems="center"
        textSize="3"
        className="header"
        flexWrap="wrap"
      >
        <span>{partita.nomeBol}</span>
        <span style={{ margin: "0 .25em" }}>-</span>
        <span style={{ marginRight: "1em" }}>{partita.nomeAvv}</span>
        <Tag
          align="center"
          size="large"
          color={setBol == 3 ? "success" : setAvv == 3 ? "danger" : ""}
        >
          {setBol} - {setAvv}
        </Tag>
      </Block>
      <Block>
        {setKeys.map((v) => (
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
        <Button onClick={eliminaPartita}>Elimina Partita</Button>
      )}
    </Box>
  );
}

function Set(props) {
  return (
    <div>
      <span>
        Set {props.set[3]}: {props.value}
      </span>
      {props.autorizzato && (
        <>
          <Button onClick={() => props.modificaSet(props.set, false, true)}>
            -
          </Button>
          <Button onClick={() => props.modificaSet(props.set, true, true)}>
            +
          </Button>
          <Button onClick={() => props.modificaSet(props.set, false, false)}>
            -
          </Button>
          <Button onClick={() => props.modificaSet(props.set, true, false)}>
            +
          </Button>
        </>
      )}
    </div>
  );
}
