// const firebaseConfig = {
//     apiKey: "AIzaSyAcobOZE24s2jixlg5X1xQoDfAfDjANgUk",
//     authDomain: "coen315final.firebaseapp.com",
//     databaseURL: "https://coen315final-default-rtdb.firebaseio.com",
//     projectId: "coen315final",
//     storageBucket: "coen315final.appspot.com",
//     messagingSenderId: "353515497206",
//     appId: "1:353515497206:web:5e655b1e9a3bc1c0aeaed7",
//     measurementId: "G-ZT19HZXKWZ"
// };
// const app = firebase.initializeApp(firebaseConfig);
var id = localStorage.getItem("userId");
if(id == null || id == 'undefined' || id == ''){
    window.location.replace("file:///C:/Users/dcost/OneDrive/Desktop/projWeb/index.html");
}

$(document).ready(function(){
    var db = firebase.database();
    
    var ledStatus;
    var waterSensor;
    var soundSensor;
    var motionSensor;
    var msg;

    var waterFlag = 0;
    var soundFlag = 0;
    var motionFlag = 0;

    var firebaseRef;
    console.log(id);
    var userName;
    var userEmail;

    var dbRef = firebase.database().ref().child("users/"+id+"/name");
    dbRef.on("value", function(snapshot) {
        userName = snapshot.val();
        $("#nameId").text("Hello, "+userName);
    }, function (error) {
        console.log("Error: " + error.code);
    });

    setInterval(function(){ 
        db.ref().on("value", function(snap){

            waterSensor = snap.val().waterSensor;
            soundSensor = snap.val().soundSensor;
            motionSensor = snap.val().motionSensor;
            
            console.log("Started");
    
            if(waterSensor == 1){
                if($('#waterSensorOff').length){
                    //console.log("waterSensorOff "+$('#waterSensorOff').length);
                    $('#waterSensorOff').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"waterSensorOn\"><img class=\"card-img-top\" src=\"wet.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The bed is wet.</p></div></div>");
                } 
                firebaseRef = firebase.database().ref().child("users/"+id+"/waterSensor");
                firebaseRef.set(waterSensor);     
                msg = "The bed is wet";
                if(waterFlag == 0){
                    dbRef = firebase.database().ref().child("users/"+id+"/email");
                    dbRef.on("value", function(snapshot) {
                        userEmail = snapshot.val();
                        console.log(userEmail);
                        sendEmail(userEmail, msg);
                    }, function (error) {
                        console.log("Error: " + error.code);
                    });
                    waterFlag = 1;
                }
            } else if(waterSensor == 0){
                if($('#waterSensorOn').length) {
                    //console.log("waterSensorOn "+$('#waterSensorOn').length);
                    $('#waterSensorOn').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"waterSensorOff\"><img class=\"card-img-top\" src=\"dry.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The bed is dry.</p></div></div>");
                }  
                firebaseRef = firebase.database().ref().child("users/"+id+"/waterSensor");
                firebaseRef.set(waterSensor);     
            }
    
            if(soundSensor == 1){
                if($('#soundSensorOff').length){
                    $('#soundSensorOff').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"soundSensorOn\"><img class=\"card-img-top\" src=\"cry.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The baby is crying.</p></div></div>");
                } 
                firebaseRef = firebase.database().ref().child("users/"+id+"/soundSensor");
                firebaseRef.set(soundSensor);
                msg = "The baby is crying";
                if(soundFlag == 0){
                    dbRef = firebase.database().ref().child("users/"+id+"/email");
                    dbRef.on("value", function(snapshot) {
                        userEmail = snapshot.val();
                        sendEmail(userEmail, msg);
                    }, function (error) {
                        console.log("Error: " + error.code);
                    });
                }
                soundFlag = 1;
            } else if(soundSensor == 0){
                if($('#soundSensorOn').length) {
                    $('#soundSensorOn').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"soundSensorOff\"><img class=\"card-img-top\" src=\"happy.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The baby is not crying.</p></div></div>");
                }
                firebaseRef = firebase.database().ref().child("users/"+id+"/soundSensor");
                firebaseRef.set(soundSensor);
            }
    
            if(motionSensor == true){
                if($('#motionSensorOff').length){
                    $('#motionSensorOff').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"motionSensorOn\"><img class=\"card-img-top\" src=\"awake.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The baby is awake.</p></div></div>");
                }
                firebaseRef = firebase.database().ref().child("users/"+id+"/motionSensor");
                firebaseRef.set(motionSensor);
                msg = "The baby is awake";
                if(motionFlag == 0){
                    dbRef = firebase.database().ref().child("users/"+id+"/email");
                    dbRef.on("value", function(snapshot) {
                        userEmail = snapshot.val();
                        sendEmail(userEmail, msg);
                    }, function (error) {
                        console.log("Error: " + error.code);
                    });
                }
                motionFlag = 1;
            } else if(motionSensor == false){
                if($('#motionSensorOn').length) {
                    $('#motionSensorOn').replaceWith("<div class=\"card mb-4 box-shadow\" style=\"display: block;\" id=\"motionSensorOff\"><img class=\"card-img-top\" src=\"sleep.png\" style=\"height: 225px; width: 100%;\"><div class=\"card-body\"><p class=\"card-text text-white\">The baby is asleep.</p></div></div>");
                }
                firebaseRef = firebase.database().ref().child("users/"+id+"/motionSensor");
                firebaseRef.set(motionSensor);
            }
        });        
    }, 5000);

    function sendEmail(currEmail, currMessage) {
        var currentdate = new Date(); 
        var datetime = "" 
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
        emailjs.init("AvdkUCN7zOw9Mgi_-");
        emailjs.send("service_o10j9mm","template_154815f",{
            to_name: currEmail,
            from_name: "dcostasavio005@gmail.com",
            message: "Hello, \n\n "+currMessage+" at "+datetime+" Regards, \n Smart Cradle IoT",
        });
    }

    $('#logout').on('click', function(){
        localStorage.removeItem("userId");
        window.location.replace("file:///C:/Users/dcost/OneDrive/Desktop/projWeb/index.html");
    });

});
