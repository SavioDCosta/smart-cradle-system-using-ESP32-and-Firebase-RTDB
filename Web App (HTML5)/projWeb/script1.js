const firebaseConfig = {
    apiKey: "AIzaSyAcobOZE24s2jixlg5X1xQoDfAfDjANgUk",
    authDomain: "coen315final.firebaseapp.com",
    databaseURL: "https://coen315final-default-rtdb.firebaseio.com",
    projectId: "coen315final",
    storageBucket: "coen315final.appspot.com",
    messagingSenderId: "353515497206",
    appId: "1:353515497206:web:5e655b1e9a3bc1c0aeaed7",
    measurementId: "G-ZT19HZXKWZ"
};
const app = firebase.initializeApp(firebaseConfig);

var userId;

$(document).ready(function(){
    var db = firebase.database();

    var firebaseRef;
    var noSpaces;

    $('#signIn').on('click', function(){
        var signInEmail = $('#signInEmail').val();
        var noSpacesSignIn = signInEmail.toString().replace(/\./g,'');
        var signInPassHash = CryptoJS.MD5($('#signInPassword').val()).toString();
        userId = noSpacesSignIn+signInPassHash;
        const dbRef = firebase.database().ref();
        console.log(userId);
        dbRef.child("users").child(userId).once("value", snapshot => {
            if (snapshot.exists()){
              //const userData = snapshot.val();
              console.log("exists!");
              localStorage.setItem("userId", userId);
              window.location.replace("file:///C:/Users/dcost/OneDrive/Desktop/projWeb/indexActual.html");
            } else {
                console.log("doesnt exists!");
                alert("Invalid email or password");
            }
        });
        $('#signInPage').modal('toggle');
        $('#signInEmail').val('');
        $('#signInPassword').val('');
    });

    $('#signUp').on('click', function(){
        var signUpName = $('#signUpName').val();
        var signUpEmail = $('#signUpEmail').val();
        var noSpacesSignUp = signUpEmail.toString().replace(/\./g,'');
        console.log(noSpacesSignUp);
        var signUpPassHash = CryptoJS.MD5($('#signUpPassword').val()).toString();
        var deviceId = $('#signUpDevice').val();
        userId = noSpacesSignUp+signUpPassHash;
        console.log(signUpEmail +" "+signUpPassHash);
        db.ref().on("value", function(snap){
            if(snap.val().deviceId == deviceId){
                firebase.database().ref('users/' + userId).set({
                    name : signUpName,
                    email : signUpEmail,
                    password : signUpPassHash
                });
                console.log("Created");
                alert("Signed Up Successfully");
            }
        });
        $('#signUpPage').modal('toggle');
        $('#signUpName').val('');
        $('#signUpEmail').val('');
        $('#signUpPassword').val('');
        $('#signUpDevice').val('');
    });

});
