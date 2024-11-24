import websockets.*;

WebsocketClient wsc;
JSONObject json;

String socketId = "";
int f = 0;
float v = 0.0f;

void setup(){
  size(500,500);
  frameRate(10);
  
  
  //wsc= new WebsocketClient(this, "ws://192.168.0.51:8080/daimoku/");  //443
  wsc= new WebsocketClient(this, "ws://god@resound.openlab.dev/daimoku/");
  //wsc= new WebsocketClient(this, "ws://dreamy-badger.apps.openlab.dev/daimoku/");
  //wsc.enableDebug();
  json = new JSONObject();
}

void draw(){
  background(0);
  fill(v * 255);
  textSize(44);
  textAlign(CENTER, CENTER);
  text(""+f,width/2,height/2);

  if(mousePressed) {
    if(socketId.length()>0){  //millis()>now+5000 &&
      int f = (int) map(mouseX,0,width,60,400);
      float v = map(mouseY,0,height,1.0f,0.0f);
      
      sendTone(f,v);
    }
  }
}

void mouseReleased() {
  sendTone(100,0.0f);
}

void sendTone(int f, float v) {
  v = v < 0.1f ? 0.0f : v;
  
  json.setString("type", "data");
  json.setInt("f", f);
  json.setFloat("v", v);
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
    f = json.getInt("f");
    v = json.getFloat("v");
    //println("data: " + f + " " + v);
  }
}
