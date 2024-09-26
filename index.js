import fs from 'fs';
import http from 'node:http'
import express from 'express'
import cors from 'cors'
import process from 'node:process'
import crypto from 'node:crypto'
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
app.use(cors());
app.use(express.static('public'));
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const sessions = {
  'test-session': new Map()
}

wss.on('connection', (ws, req) => {
  console.log(req.url);

  try {
    const match = /session\/(.+)\/?/.exec(req.url)
    if (!match) {
      console.error('Invalid socket path', req.url)
      return
    }

    const session = sessions[match[1]]
    if (!session) {
      console.error('Invalid session', match[1])
      return
    }

    const socketId = crypto.randomUUID()
    console.debug('ws@connection', socketId)
    session.set(socketId, ws)

    ws.on('error', (...args) => console.error('wss@error', ...args));

    ws.on('message', (data) => {
      try {
        console.debug('wss@message: %s', data);
        const { type, ...payload } = JSON.parse(data)

        for (const [id, socket] of session.entries()) send(socket, id, {type,...payload})

      } catch (error) {
        console.error('wss@message - invalid payload', error)
      }
    });

    ws.on('close', () => {
      console.debug('ws@close', socketId)
      session.delete(socketId)
    })

    send(ws, socketId, { type:'id', socketId })
  } catch (error) {
    console.error('socket error', error)
  }
});

function send(ws, socketId, payload) {
  console.debug('send id=%s', socketId, payload)
  ws.send(JSON.stringify(payload));
}

process.on('uncaughtException', function (err) {
   console.log(err);
   process.exit(1);
});

server.listen(8080);
console.log('listening on 8080')