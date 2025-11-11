import streamDeck from "@elgato/streamdeck";
import WebSocket, { WebSocketServer } from "ws";
import { execSync } from "child_process";
import process from "node:process";
import fs from "node:fs";
import http from "node:http";

const log = (...m: any) => {
    fs.appendFileSync("/tmp/webby.log", m + "\n");
    console.log(m) // backup
}

process.on("uncaughtException", e =>
    // super useful to find this in my log file! otherwise streamdeck swallows
    log("Uncaught exception: " + e.stack)
);
process.on("unhandledRejection", e =>
    log("Unhandled rejection: " + e)
);

export function startExternalServer() {
    const BASE_PORT = 8100;
    const uid = parseInt(execSync("id -u").toString(), 10);
    const userPortOffset = (uid % 100);
    const userPort = BASE_PORT + userPortOffset;

    // * reuseAddr=True (only reason I am creating http server "manually")... b/c I cannot pass reuseAddr to WebSocketServer ctor
    const httpServer = http.createServer();
    httpServer.listen({ port: userPort, host: "127.0.0.1", reuseAddr: true });

    // SO_REUSEADDR - most likely node is already setting this, so my reuseAddr isn't likely needed, but doesn't hurt for now
    const wss = new WebSocketServer({ server: httpServer });
    wss.on("connection", ws => {
        log("connected");

        ws.on("message", rawMessage => {
            const message = rawMessage.toString();
            log("rx msg: " + message)
            try {
                const payload = JSON.parse(message);
                // if (payload.title && streamDeck?.readyState === WebSocket.OPEN) {
                streamDeck.actions.forEach(action => log('action', JSON.stringify(action)))
                // streamDeck.send(
                //     JSON.stringify({
                //         event: "setTitle",
                //         context: "com.wes.kmtrigger",
                //         payload: { title: payload.title },
                //     })
                // );
                // }
            } catch (err) {
                log("message handling failure", err);
                console.error("message handling failure", err);
            }
        });
    })

    wss.on("close", () => log("WSS close"));
    wss.on("error", err => {
        log("WSS error", err.message);
        console.error("WSS error", err);
    });
    wss.on("listening", () => {
        const address = httpServer.address();
        log('WSS listening on', JSON.stringify(address));
    });
}
