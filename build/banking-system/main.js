// Set the configuration for your app
// TODO: Replace with your project's config objec

// Get a reference to the database service
var usersRef = firebase.database().ref("/Customers");
var customersRef;

const encrypt = text => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = data => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

function encryptPassword(password)
{
  console.log(encrypt(password));
}

function getInfo() {
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    usersRef.once("value", function(snapshot) {
      var users = snapshot.val();

      if (username == "" || password == "")
        window.alert("PLEASE ENTER A VALID USERNAME AND PASSWORD");
      else 
      {
        for (let user in users)
        {
          if (users[user].username == username)
          {
            customersRef = users[user];
            sessionStorage.setItem("userInfo", JSON.stringify(users[user]));
            sessionStorage.setItem("user", JSON.stringify(user));
            verifyInfo(users[user]);
            break;
          }
        }
      }  
    });
}

function verifyInfo(user) {
  if (username != user.username || password != decrypt(user.password))
    window.alert("INCORRECT USERNAME AND/OR PASSWORD")
  else
    window.location.href = "welcome.html";
}

function changeToCustomerName(id) {
  var userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  document.getElementById(id).innerHTML = "Good day, " + userInfo.name;
}

function getSavingsAmount(id) {
  var userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  document.getElementById(id).innerHTML = "$" + userInfo.savings_amount;
}

function getCheckingAmount(id) {
  var userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  document.getElementById(id).innerHTML = "$" + userInfo.checking_amount;
}

function sendMoney(sendFrom) {

  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    var username = document.getElementById("username").value;
    var amount = parseFloat(document.getElementById("amount").value);
    var radios = document.getElementsByName("radiobutton");
    console.log(username);
    console.log(amount);

    var accountType;
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        accountType = radios[i];
        // alert(radios[i].value);

        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
    
    for (let user in users)
    {
      if (users[user].username == username)
      {
        console.log(accountType.value);
        if (accountType.value == "savings_amount")
        {
          var infoFrom = JSON.parse(sessionStorage.getItem("userInfo"));
          var balanceTo = parseFloat(users[user].savings_amount);
          var newBalanceTo = balanceTo + amount;
          if (sendFrom == "savings")
          {
            var balanceFrom = parseFloat(infoFrom.savings_amount);
            var newBalanceFrom; 
            if (amount > balanceFrom)
            {
              window.alert("The amount you want to send is greater than the amount you have in your account");
              break;
            }
            else 
            {
              newBalanceFrom = balanceFrom - amount;
            }
            firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child("savings_amount").set(newBalanceFrom.toString());
          }
          else
          {
            var balanceFrom = parseFloat(infoFrom.checking_amount);
            var newBalanceFrom; 
            if (amount > balanceFrom)
            {
              window.alert("The amount you want to send is greater than the amount you have in your account");
              break;
            }
            else 
            {
              newBalanceFrom = balanceFrom - amount;
            }
            firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child("checking_amount").set(newBalanceFrom.toString());
          }
          firebase.database().ref("/Customers/" + user).child("savings_amount").set(newBalanceTo.toString());
        }
        else 
        {
          var infoFrom = JSON.parse(sessionStorage.getItem("userInfo"));
          var balanceTo = parseFloat(users[user].checking_amount);
          var newBalanceTo = balanceTo + amount;
          if (sendFrom == "savings")
          {
            var balanceFrom = parseFloat(infoFrom.savings_amount);
            var newBalanceFrom; 
            if (amount > balanceFrom)
            {
              window.alert("The amount you want to send is greater than the amount you have in your account");
              break;
            }
            else 
            {
              newBalanceFrom = balanceFrom - amount;
            }
            firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child("checking_amount").set(newBalanceFrom.toString());
          }
          else
          {
            var balanceFrom = parseFloat(infoFrom.checking_amount);
            var newBalanceFrom; 
            if (amount > balanceFrom)
            {
              window.alert("The amount you want to send is greater than the amount you have in your account");
              break;
            }
            else 
            {
              newBalanceFrom = balanceFrom - amount;
            }
            firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child("checking_amount").set(newBalanceFrom.toString());
          }
          firebase.database().ref("/Customers/" + user).child("savings_amount").set(newBalanceTo.toString());
        }    
      }
    }
  });
}
