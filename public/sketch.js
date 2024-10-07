let statuscode = 0;
let rotation = 0, targetRotation = 0;
var logo;

var graph = [];
var debug = false;

function preload(){
  logo = loadImage("/remote/resound_logo.png");
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  let button = createButton('debug');
  button.position(0, 100);
  button.mousePressed(toggleDebug);

  setInterval(getStatus,5000);
}

function toggleDebug() {
  debug = !debug;
  if(debug && !webSocketConnected) webSocketConnect();
}

function draw(){
  background(200);
  push();
    translate(width/2, height/2);
    rotation = rotation + 0.1 * (targetRotation - rotation);
    rotate(rotation);
    push();
      translate(-logo.width/2, -logo.height/2);
      image(logo, 0, 0, logo.width, logo.height);
    pop();
  pop();

  push();
    const graphWidth = 100;
    translate((width/2) - (graphWidth/2), height-100);
    drawGraph(0,0,graphWidth,50);
  pop();
}

var minY=undefined, maxY=undefined;
function drawGraph(x,y,w,h) {
  stroke(0);
  if(graph.length > 0) {
    if(minY == undefined && maxY == undefined) {
      minY = 0, maxY = 100;
      for(var n=0;n<graph.length;++n) {
        minY=min(minY, graph[n]);
        maxY=max(maxY, graph[n]);
      }
      maxY = maxY * 1.5;
      console.log(minY,maxY);
    }

    var wb = w/graph.length;
    for(var n=0;n<graph.length;++n) {
      rect(x + (wb*n), y, wb, -((graph[n] - minY)/(maxY-minY))*h);
    }
  }
}

function modelLoaded(loadModel){ 
  return;
}

const getStatus = async _ => {
  try{
    const response = await fetch('/yoyo/status');
    const data = await response.json();

    statuscodeChange = statuscode ^ data.statuscode;
    if(statuscodeChange != 0) {
      if(statuscodeChange == 0xF0) {
        if((data.statuscode & statuscodeChange) == 0xF0) targetRotation = 0;
        else targetRotation = -PI;
      }
    }
    statuscode = data.statuscode;
  }
  catch(e) {
  }
}

async function getConfig() {
  try{
    const response = await fetch('/yoyo/config');
    const data = await response.json();

    console.log(data)
  }
  catch(e) {
  }
}

//---
let webSocket;
let webSocketConnected = false;

function webSocketConnect() {
  let webSocketURL = 'ws://' + getHost() + ':81/';
  console.log(webSocketURL);

  webSocket = new WebSocket(webSocketURL);
  webSocket.onmessage = function(event) {
      if(!webSocketConnected) {
          webSocketConnected = true;
      }
      if(debug) {
        console.log("[LOG] ", event.data);
        parseLog(event.data);
      }
  }

  webSocket.onclose = function(e) {
      console.debug('Web socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(function() {
          webSocketConnect();
      }, 1000);
    };

  webSocket.onerror = function(event) {
      console.debug('webSocket.onerror', event);
  };
}

function getHost() {
  let host = window.location.host;
  if(host.length > 0) {
      //Take off any port number:
      let i = host.indexOf(":");
      if(i >= 0) host = host.slice(0, i);

      //Make sure this is an IP address (can be captive.apple.com etc):
      let ipAddress = host.split('.');
      if(ipAddress.length == 4 && parseInt(ipAddress[0]) != NaN) {
          //IP address looks OK
      }
      else {
          host = '192.168.4.1';
      }
  }
  else host = '192.168.4.1';

  return(host);
}

function parseLog(line) {
  let t = splitTokens(line, ' ');
  if(t.length > 1) {
    if(t[0] == 'n') {
      graph = [];
      for(var n=1;n<t.length;++n) {
        graph.push(t[n]);
      }
      console.log(graph);
    }
    else if(t[0] == 'f') {
      var frequency = Number(t[1]);
      var volume = Number(t[2]);
      if(volume > 0.3) console.log(frequency, volume);
    }
  }

}