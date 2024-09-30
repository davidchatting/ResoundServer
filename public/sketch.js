let statuscode = 0;
let rotation = 0, targetRotation = 0;
var logo;

function preload(){
  logo = loadImage("http://192.168.0.51:8080/resound_logo.png");
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  setInterval(getStatus,1000);
}

function draw(){
  background(200);
  translate(width/2, height/2);
  rotation = rotation + 0.1 * (targetRotation - rotation);
  rotate(rotation);
  push();
    translate(-logo.width/2, -logo.height/2);
    image(logo, 0, 0, logo.width, logo.height);
  pop();
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