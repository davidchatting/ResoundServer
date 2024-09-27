let statuscode = 0;
let rotationX = 0, targetRotationX = 0;

function preload(){
  objModel = loadModel('http://192.168.0.51:8080/resound.obj', true, modelLoaded());
}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);

  setInterval(getStatus,500);
}


function draw(){
  background(200);
  
  //ambientLight(10);
  //specularMaterial(100);

  rotationX = rotationX + 0.1 * (targetRotationX - rotationX)
  rotateX(rotationX);
  rotateY(frameCount * 0.01);
  rotateZ(PI);
  normalMaterial();
  model(objModel);
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
        if((data.statuscode & statuscodeChange) == 0xF0) targetRotationX = PI * -0.25;
        else targetRotationX = PI * 0.8;
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