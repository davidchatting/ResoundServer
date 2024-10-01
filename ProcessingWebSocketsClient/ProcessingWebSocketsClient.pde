import websockets.*;

WebsocketClient wsc;
JSONObject json;
int now;

String socketId;

void setup(){
  size(200,200);
  
  wsc= new WebsocketClient(this, "ws://localhost:8080/hello");
  json = new JSONObject();
  now=millis();
}

void draw(){    
  if(millis()>now+5000){
    int f = (int) map(mouseX,0,width,100,300);
    float v = map(mouseY,0,height,0.0f,1.0f);
    
    json.setString("type", "data");
    json.setInt("f", f);
    json.setFloat("v", v);
    json.setString("sender", socketId);
    
    wsc.sendMessage(json.toString());
    now=millis();
  }
}

void webSocketEvent(String msg){
  println(msg);
  JSONObject json = parseJSONObject(msg);
  if(json.getString("type").equals("id")) {
    socketId = json.getString("socketId");
  }
}
