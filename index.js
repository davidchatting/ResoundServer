import http from "node:http";
import express from "express";
import cors from "cors";
import process from "node:process";
import crypto from "node:crypto";
import { WebSocketServer } from "ws";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));

const app = express().use(cors()).use(express.static("public"));

app.get("/api/", (req, res) => {
  res.json({
    meta: {
      name: pkg.name,
      version: pkg.version,
    }
  })
})

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const sessions = new Map();

function upsertSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
    session = new Map();
    sessions.set(sessionId, session);
  }
  return session;
}

wss.on("connection", (ws, req) => {
  console.log(req.url);

  try {
    const match = /(.+)\/?/.exec(req.url);
    if (!match) {
      console.error("Invalid socket path", req.url);
      return;
    }
    const sessionId = match[1];
    const session = upsertSession(sessionId);

    const socketId = crypto.randomUUID();
    console.debug("ws@connection", socketId);
    session.set(socketId, ws);

    ws.on("error", (...args) => console.error("wss@error", ...args));

    ws.on("message", (data) => {
      try {
        const session = upsertSession(sessionId);
        const json = JSON.parse(data);

        for (const [id, socket] of session.entries()) {
          if (id !== json["sender"]) {
            send(socket, id, json);
          }
        }
      } catch (error) {
        console.error("wss@message - invalid payload", error);
      }
    });

    ws.on("close", () => {
      //TODO - remove inactive sessions - go through map and count ids - zero then delete
      console.debug("ws@close", socketId);
      session.delete(socketId);
    });

    send(ws, socketId, { type: "id", socketId });
  } catch (error) {
    console.error("socket error", error);
  }
});

function send(ws, socketId, payload) {
  console.debug("send id=%s", socketId, payload);
  ws.send(JSON.stringify(payload));
}

process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit(0);
  })
});

server.listen(8080, () => {
  console.log("listening on http://0.0.0.0:8080");
});
