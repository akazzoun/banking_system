// Set the configuration for your app
// TODO: Replace with your project's config objec

// Get a reference to the database service
var customersRef = firebase.database().ref("/Customers/User1");


const encrypt = text => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = data => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

function getInfo() {
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    if (username == "" || password == "")
      window.alert("PLEASE ENTER A VALID USERNAME AND PASSWORD");
    verifyInfo();
}

function verifyInfo() {
  customersRef.once("value", function(snapshot) {
    var userInfo = snapshot.val();

    // console.log(userInfo.username);
    if (username != userInfo.username || password != decrypt(userInfo.password))
      window.alert("INCORRECT USERNAME AND/OR PASSWORD")
    else
      window.location.href = "file:///C:/Users/akazz/Desktop/School/POOSD/Banking_System/welcome.html";
  });
}
