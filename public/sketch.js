function preload(){
  teapot = loadModel('http://192.168.0.51:8080/resound.obj', true, modelLoaded());
}

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);

  setInterval(getData,3000);
}

function draw(){
  background(200);
  
  ambientLight(10);
  specularMaterial(100);

  rotateX(-PI/4);
  rotateY(frameCount * 0.01);
  rotateZ(PI);
  normalMaterial();
  model(teapot);
}

function modelLoaded(loadModel){ 
  return;
}

const getData = async _ => {
  try{
    const response = await fetch('/yoyo/status');
    const data = await response.json();

    console.log(data)
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