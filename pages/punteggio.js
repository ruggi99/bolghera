import React from "react"
import useWebsocket from "../components/websocket.js"

const fetcher = (url) => fetch(url).then((res) => res.json());

// function Punteggio(props) {
//     const { data, error } = useSWR("http://localhost:8000/punteggio", fetcher, {refreshInterval: 3000})
//     console.log(data)
//     return <UI data={data} />
// }

function Punteggio(props) {
    const data = useWebsocket("ws://192.168.1.121:8500/")
    console.log(data)
    return <UI data={data} />
}

function UI(props) {
    if (!props.data || !props.data.elenco || !props.data.note) return null
    const note = props.data.note
    const elenco = props.data.elenco
    const commento = note.Commento.split(";");
    return (
        <table className="overlay">
            <thead></thead>
            <tbody>
                <tr>
                    <td>{commento[2] != "no comments" && commento[2] || note.SqInDesC}</td>
                    <td>{note.SE0}</td>
                    <td>{note.PT0}</td>
                    <td>{note.FB ? null : <Ball/>}</td>
                </tr>
                <tr>
                    <td>{commento[3] != "no comments" && commento[3]|| note.SqOsDesC}</td>
                    <td>{note.SE1}</td>
                    <td>{note.PT1}</td>
                    <td>{note.FB ? <Ball /> : null}</td>
                </tr>
            </tbody>
        </table>
    );
}

function Ball() {
    return <img src="/v300.png" />
}

export default Punteggio