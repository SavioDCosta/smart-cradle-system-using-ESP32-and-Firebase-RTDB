static const int respin = 21; // sensor pin used
static const int servoPin = 12; //printed G14 on the board
//static const int pir_pin = 22; //PIR Sensor
const int trigPin = 23;   //UltraSonic
const int echoPin = 22;   //UltraSonic
const int SoundSensor_PIN = 5; // Sound Sensor

#include <ESP32Servo.h> 
#include <Arduino.h>
#include <Firebase_ESP_Client.h>
#include <WiFi.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

#define WIFI_SSID "Let'sGoToMars"
#define WIFI_PASSWORD "SCU_INDIA"

#define FIREBASE_HOST "coen315final-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "AIzaSyAcobOZE24s2jixlg5X1xQoDfAfDjANgUk"

#define USER_EMAIL "savio.a.dcosta@gmail.com";
#define USER_PASSWORD "Stefan@888";

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signUpOk = false;

Servo servo1;

const int SAMPLE_TIME = 1000;
//define sound speed in cm/uS
#define SOUND_SPEED 0.034
#define CM_TO_INCH 0.393701
unsigned long millisCurrent;
unsigned long millisLast = 0;
unsigned long millisElapsed = 0;
int sampleBufferValue = 0;
int angle =0;
int angleStep = 5;
int resval = 0;  // holds the value
int angleMin =-100;
int angleMax = 100;
bool isDetected = false;
bool fireFlag = true;
//UltraSonic
long duration;
float distanceCm;
float distanceInch;

void setup()
{
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting");
  while(WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected");
  Serial.println(WiFi.localIP());
  Serial.println();

  config.api_key = FIREBASE_AUTH;
  config.database_url = FIREBASE_HOST;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  if(Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signUpOk = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }
  
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  //pinMode(pir_pin,INPUT);
  pinMode(2, OUTPUT);
  servo1.attach(servoPin);
}


 
void loop()
{
  if(Firebase.ready() && signUpOk){
    if(Firebase.RTDB.getBool(&fbdo, "servoControl")){
      Serial.println("Received Servo Control o/p");
      fireFlag = fbdo.boolData();
      Serial.println(fireFlag);
    } else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }

  if(fireFlag){
    for(int angle = 0; angle <= angleMax; angle +=angleStep) {
        servo1.write(angle);
        delay(30);
    }
    for(int angle = 100; angle >= angleMin; angle -=angleStep) {
        servo1.write(angle);
        delay(30);
    }
  }
  
  checkSound();
  checkWaterLevel();
//  bool isDetected =  (pir_pin);
//  int pirSensor;
  isDetected = false;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  
  // Calculate the distance
  distanceCm = duration * SOUND_SPEED/2;
  
  // Convert to inches
  //distanceInch = distanceCm * CM_TO_INCH;
  if(distanceCm <12 ){
    Serial.println("Motion Detected !!");
    Serial.println(distanceCm);
    isDetected = true;
  }

  if(Firebase.ready() && signUpOk){
    if(Firebase.RTDB.setBool(&fbdo, "motionSensor", isDetected)){
      Serial.println("PASSED");
      Serial.println("PATH: " + fbdo.dataPath());
      Serial.println("TYPE: " + fbdo.dataType());
    }
    else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
  
  if(isDetected && !fireFlag){
    for(int angle = 0; angle <= angleMax; angle +=angleStep) {
        servo1.write(angle);
        delay(30);
    }

    for(int angle = 100; angle >= angleMin; angle -=angleStep) {
        servo1.write(angle);
        //Serial.println(angle);
        delay(30);
    }
    for(int angle = -100; angle >= 0; angle +=angleStep) {
        servo1.write(angle);
        //Serial.println(angle);
        delay(30);
    }
    Serial.println("Rocking the cradle stopped !!");
    
  }
  delay(1000);
  Serial.println("Delay Over");
  //delay(500);
}

void checkSound()
{
  int isSound=0;
  sampleBufferValue=0;
  for(int i=0;i<10;i++){
    if (digitalRead(SoundSensor_PIN) == 1) {
      sampleBufferValue++;
    }
    delay(100);
  }
  if(sampleBufferValue > 7) {
      Serial.println("Baby is CRYing !!");
      Serial.println(sampleBufferValue);
      isSound = 1;
  }
  else
  {
    Serial.println("Baby is Asleep");
    isSound = 0;
  }
  if(Firebase.ready() && signUpOk){
    if(Firebase.RTDB.setInt(&fbdo, "soundSensor", isSound)){
      Serial.println("Entered soundSensor o/p ");
      //Serial.println(isSound);
    } else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}

void checkWaterLevel()
{
  int isWater;
  resval=0;
  resval = analogRead(respin); //Read data from analog pin and store it to resval variable
  if (resval<=300){ 
    Serial.println("Water Level: Not wet Enough");
    Serial.println(resval);
    isWater = 0; 
  } 
  else if (resval>300){ 
    Serial.println("Water Level: High");
    Serial.println(resval);
    isWater = 1; 
  }
  if(Firebase.ready() && signUpOk){
    if(Firebase.RTDB.setInt(&fbdo, "waterSensor", isWater)){
      Serial.println("Entered waterSensor o/p ");
      //Serial.println(resval);
    } else {
      Serial.println("FAILED");
      Serial.println("REASON: " + fbdo.errorReason());
    }
  }
}
