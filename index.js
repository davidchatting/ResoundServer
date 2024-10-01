import http from 'node:http'
import express from 'express'
import cors from 'cors'
import process from 'node:process'
import crypto from 'node:crypto'
import { WebSocketServer } from 'ws';

const app = express();
app.use(cors());
app.use(express.static('public'));
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const sessions = {}
function addSession(path) {
  sessions[path] = new Map()
  return(sessions[path])
}

wss.on('connection', (ws, req) => {
  console.log(req.url);

  try {
    const match = /(.+)\/?/.exec(req.url)
    if (!match) {
      console.error('Invalid socket path', req.url)
      return
    }

    var session = sessions[match[1]]
    if (!session) session = addSession(match[1]);

    const socketId = crypto.randomUUID()
    console.debug('ws@connection', socketId)
    session.set(socketId, ws)

    console.log('***', session)

    ws.on('error', (...args) => console.error('wss@error', ...args));

    ws.on('message', (data) => {
      try {
        const json = JSON.parse(data)
        
        for (const [id, socket] of session.entries()) {
          if(id !== json['sender']) {
            console.log("*", id, json)
            send(socket, id, json)
          }
        }
      }
      catch (error) {
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