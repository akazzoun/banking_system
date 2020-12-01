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
  // console.log(encrypt(password));
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
            sessionStorage.setItem("savings_amount", users[user].savings_amount);
            sessionStorage.setItem("checking_amount", users[user].checking_amount);
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
  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    for (let user in users)
    {
      if (JSON.stringify(user) == sessionStorage.getItem("user"))
      {
        document.getElementById(id).innerHTML = "$" + users[user].savings_amount;
        break;
      }
    }
  });
}

function getCheckingAmount(id) {
  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    for (let user in users)
    {
      if (JSON.stringify(user) == sessionStorage.getItem("user"))
      {
        document.getElementById(id).innerHTML = "$" + users[user].checking_amount;
        break;
      }
    }
  });
}

function sendMoney(sendFrom) {

  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    var username = document.getElementById("username").value;
    var amount = parseFloat(document.getElementById("amount").value);
    var radios = document.getElementsByName("radiobutton");
    // console.log(username);
    // console.log(amount);

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
        // console.log(accountType.value);
        // Savings
        if (sendFrom == "savings")
        {
          sendMoneyHelper(users, user, "savings_amount", amount, accountType);
        }
        // Checking
        else if (sendFrom == "checking")
        {
          sendMoneyHelper(users, user, "checking_amount", amount, accountType);
        }   
      }
    }
  });
}

function sendMoneyHelper(users, user, child, amount, accountType) {
  var savingsFrom = sessionStorage.getItem(child);
  var balanceFrom = parseFloat(savingsFrom);
  var newBalanceFrom; 
  // console.log(savingsFrom);
  // console.log("new");
  if (accountType.value == "Savings")
  {
    var balanceTo = parseFloat(users[user].savings_amount);
    var newBalanceTo = balanceTo + amount;
    if (amount > balanceFrom)
    {
      window.alert("The amount you want to send is greater than the amount you have in your account");
      return;
    }
    else 
    {
      newBalanceFrom = balanceFrom - amount;
      sessionStorage.setItem(child, newBalanceFrom.toString());
      // console.log(newBalanceFrom);
    }
    firebase.database().ref("/Customers/" + user).child("savings_amount").set(newBalanceTo.toString());
    // console.log("success");
  }
  else if (accountType.value == "Checking")
  {
    var balanceTo = parseFloat(users[user].checking_amount);
    var newBalanceTo = balanceTo + amount;
    if (amount > balanceFrom)
    {
      window.alert("The amount you want to send is greater than the amount you have in your account");
      return;
    }
    else 
    {
      newBalanceFrom = balanceFrom - amount;
      sessionStorage.setItem(child, newBalanceFrom.toString());
      // console.log(newBalanceFrom);
    }
    firebase.database().ref("/Customers/" + user).child("checking_amount").set(newBalanceTo.toString());
    // console.log("success");
  }
  firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child(child).set(newBalanceFrom.toString());
  window.alert("Money sent! Please return to the front page to see your updated balances")
}

