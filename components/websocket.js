import React, { useCallback, useEffect, useState } from "react"

var waiting = false

export default function useWebsocket(url) {
    const [ws, setWs] = useState(null)
    const [data, setData] = useState(null)
    const [fake, setFake] = useState(0)
    const onMessage = useCallback((ev) => { 
        setData(JSON.parse(ev.data))
    }, [setData])
    const openWs = useCallback(() => {
        const _ws = new WebSocket(url)
        _ws.addEventListener("message", onMessage)
        _ws.addEventListener("open", () => console.log("Websocket aperto"))
        _ws.addEventListener("close", waitAndOpen)
        _ws.addEventListener("error", waitAndOpen)
        setWs(_ws)
    }, [setWs, onMessage])
    const waitAndOpen = useCallback(async () => {
        if (waiting) return
        waiting = true
        console.error("C'è stato un errore")
        await new Promise((res) => setTimeout(res, 10000))
        waiting = false
        openWs()
    }, [openWs])
    useEffect(openWs, [])
    return data
}