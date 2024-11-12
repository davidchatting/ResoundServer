import websockets.*;

WebsocketClient wsc;
JSONObject json;
int now;

String socketId = "";
int f = 0;
float v = 0.0f;

void setup(){
  size(200,200);
  
  
  //wsc= new WebsocketClient(this, "ws://192.168.0.51:8080/daimoku/");  //443
  wsc= new WebsocketClient(this, "ws://resound.openlab.dev/daimoku/");
  //wsc= new WebsocketClient(this, "ws://dreamy-badger.apps.openlab.dev/daimoku/");
  //wsc.enableDebug();
  json = new JSONObject();
  now=millis();
}

void draw(){
  background(0);
  fill(v * 255);
  textSize(44);
  textAlign(CENTER, CENTER);
  text(""+f,width/2,height/2);

  if(millis()>now+5000 && socketId.length()>0){
    int f = (int) map(mouseX,0,width,100,300);
    float v = map(mouseY,0,height,0.0f,1.0f);
    
    json.setString("type", "data");
    json.setInt("f", f);
    json.setFloat("v", v);
    json.setString("sender", socketId);
    
    println("send > " + json.toString());
    
    wsc.sendMessage(json.toString());
    now=millis();
  }
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
