import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('Connection established!');
    
    connection.on('error', function(error) {
        console.log("Connection error: " + error.toString());
    });
    
    connection.on('close', function() {
        console.log('Connection closed!');
    });
    
    connection.on('message', function(message) {
        console.log("Current time on server is: '" + message.utf8Data + "'");
    });

    function send() {
        if (connection.connected) {
            console.log('bonjour');
            connection.send('bonjour' + connection.url);
            // var number = Math.round(Math.random() * 0xFFFFFF);
            // connection.sendUTF(number.toString());
            // setTimeout(sendNumber, 1000);
        }
    }

    setInterval(function(){
        send();
    }, 3000);
});

function init() {
    //client.connect('wss://clever-dolphin.apps.openlab.dev:443/hello');
    client.connect('ws://localhost:8080/hello');
    //client.connect('ws://localhost:8080/rogerroger');
}

init();