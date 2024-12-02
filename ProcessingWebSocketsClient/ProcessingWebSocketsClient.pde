import de.looksgood.ani.*;
import de.looksgood.ani.easing.*;

import websockets.*;

WebsocketClient wsc;

String socketId = "";
int micF = 0;
float micV = 0.0f;
int micX=-1, micY=-1;

int waveF = 0;
float waveV = 0.0f;
int waveX=-1, waveY=-1;

float notes[] = {261.63f, 277.18f, 293.66f, 311.13f, 329.63f, 349.23f, 369.99f, 392.00f, 415.30f, 440.00f, 466.16f, 493.88f};
String keys = "qwertyuiop[]";

int minFrequency = 80, maxFrequency=500;

void setup(){
  size(500,500);
  frameRate(10);
  
  
  //wsc= new WebsocketClient(this, "ws://192.168.0.51:8080/daimoku/");  //443
  wsc= new WebsocketClient(this, "ws://god@resound.openlab.dev/daimoku/");
  //wsc= new WebsocketClient(this, "ws://dreamy-badger.apps.openlab.dev/daimoku/");
  //wsc.enableDebug();
  
  Ani.init(this);
}

void draw(){
  background(0);
  drawWave();
  drawMic();

  if(mousePressed) {
    if(socketId.length()>0){  //millis()>now+5000 &&
      int f = (int) map(mouseX,0,width,minFrequency,maxFrequency);
      float v = map(mouseY,0,height,1.0f,0.0f);
      
      if(!ready) f=-1;
      sendTone(f,v,0);
    }
  }
}

void drawWave() {
  noFill();
  stroke(255);
  
  waveX = (int)map(waveF,minFrequency,maxFrequency,0,width);
  waveY = (int)map(waveV,1.0f,0.0f,0,height);
  
  int r = 10;
  circle(waveX,waveY,r);
  fill(255);
  textSize(10);
  text(""+waveF, waveX+r, waveY);
}

void drawMic() {
  noFill();
  stroke(micV * 255);
  
  Ani.to(this, 1.0, "micX", (int)map(micF,minFrequency,maxFrequency,0,width));
  Ani.to(this, 1.0, "micY", (int)map(micV,1.0f,0.0f,0,height));
  
  int r = 10;
  line(micX-(r/2),micY-(r/2),micX+(r/2),micY+(r/2));
  line(micX-(r/2),micY+(r/2),micX+(r/2),micY-(r/2));
  fill(micV * 255);
  textSize(10);
  text(""+micF, micX+r, micY);
}

void mouseReleased() {
  sendTone(-1,0.0f,100);
}

boolean ready = true;
void keyPressed() {
  if(ready) {
    int k = keys.indexOf(key);
    if(k >= 0) {
      sendTone((int)notes[k], 0.25f, 0);
      ready = false;
    }
  }
}

void keyReleased() {
  int k = keys.indexOf(key);
  if(k >= 0) {
    sendTone((int)notes[k], 0.25f, 50);
  }
  ready = true;
}

void sendTone(int f, float v) {
  sendTone(f,v,0);
}

void sendTone(int f, float v, int t) {
  v = v < 0.1f ? 0.0f : v;
  
  waveF = f;
  waveV = v;
  
  JSONObject json = new JSONObject();
  json.setString("type", "data");
  if(f>=0) json.setInt("f", f);
  if(v>=0) json.setFloat("v", v);
  if(t>=0) json.setFloat("t", t);
  json.setString("shape","sine");
  json.setString("sender", socketId);
  
  println("send > " + json.toString());
  
  wsc.sendMessage(json.toString());
}

void webSocketEvent(String msg){
  println(msg);
  JSONObject json = parseJSONObject(msg);
  String type = json.getString("type");
  if(type.equals("id")) {
    socketId = json.getString("socketId");
  }
  else if(type.equals("data")) {
    micF = json.getInt("f");
    micV = json.getFloat("v");
    //println("data: " + f + " " + v);
  }
}
