import React from "react"
import useWebsocket from "../components/websocket.js"

const fetcher = (url) => fetch(url).then((res) => res.json());

function Punteggio(props) {
    const data = useWebsocket()
    console.log(data)
    return <UI data={data} />
}

function UI(props) {
    if (!props.data) return null
    const note = props.data.note
    const elenco = props.data.elenco
    const commento = props.data.note.Commento.split(";");
    //const score = props.data.note[`Set${props.data.note.SC0 + props.data.note.SC1 + 1}PP4`].split("-")
    return (
        <table className="overlay">
            <thead></thead>
            <tbody>
                <tr>
                    <td>{commento[2] != "no comments" && commento[2] || props.data.note.SqInDesC}</td>
                    <td>{props.data.note.SE0}</td>
                    {Array(5).fill().map((v, i) => {
                        var score = note[`Set${i + 1}PP4`]
                        if (!score) return <td />
                        score = score.split("-").map(v => parseInt(v))
                        const is_bold = score[0] >= (i == 4 ? 25 : 15) && score[0] - score[1] >= 2
                        return (<td  key={i} style={is_bold ? {fontWeight:"bold"} : undefined}>{score[0]}</td>)
                    })}
                </tr>
                <tr>
                    <td>{commento[3] != "no comments" && commento[3] || props.data.note.SqOsDesC}</td>
                    <td>{props.data.note.SE1}</td>
                    {Array(5).fill().map((v, i) => {
                        var score = note[`Set${i + 1}PP4`]
                        if (!score) return <td />
                        score = score.split("-").map(v => parseInt(v))
                        const is_bold = score[1] >= (i == 4 ? 25 : 15) && score[1] - score[0] >= 2
                        return (<td key={i} style={is_bold ? {fontWeight:"bold"} : undefined}>{score[1]}</td>)
                    })}
                </tr>
            </tbody>
        </table>
    );
}

export default Punteggio