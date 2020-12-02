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
            sessionStorage.setItem("username", users[user].username)
            sessionStorage.setItem("name", users[user].name)
            verifyInfo(users[user]);
            break;
          }
        }
      }  
    });
}

function getDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var hour = String(today.getHours()).padStart(2, '0');
  var mins = String(today.getMinutes()).padStart(2, '0')
  
  today = mm + '/' + dd + '/' + yyyy + "  " + hour + ':' + mins;
  return today;
}

function fillTransactionTable() {
  usersRef.once("value", function(snapshot) {
    var table = document.getElementById("table");
    var users = snapshot.val();
    for (let user in users)
    {
      // console.log(JSON.stringify(users));
      if (JSON.stringify(user) == sessionStorage.getItem("user"))
      {
        var transactions = users[user].transactions;
        var transactionsLength = Object.keys(transactions).length;
        //var counter = 0;
        var start = transactionsLength;
        console.log(transactionsLength)

        for (let transaction in transactions)
        {
          if (start > 10) {
            start--;
            continue;
          }
          var row = table.rows[start];
          start--;

          row.cells[0].innerHTML = transactions[transaction].transactionID;
          row.cells[1].innerHTML = transactions[transaction].transaction_type;
          row.cells[2].innerHTML = transactions[transaction].name;
          row.cells[3].innerHTML = "$" + transactions[transaction].amount;
          row.cells[4].innerHTML = transactions[transaction].date;

        }
      }
    }
  });
}

function createTransaction(username, transactionType, name, amount, date) {
  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    for (let user in users)
    {
      // console.log(JSON.stringify(users)); 
      if (users[user].username == username)
      {
        var transactions = users[user].transactions;
        var transactionsLength = Object.keys(transactions).length;
        var transactionID = (transactionsLength + 1).toString();
        
        console.log(JSON.stringify(user));
        firebase.database().ref("/Customers/" + JSON.parse(JSON.stringify(user)) + "/transactions").push().set({
          amount: amount,
          date: date,
          name: name,
          transactionID: transactionID,
          transaction_type: transactionType
        });
      }
    }
  });
}

function transactionPage() {
  var table = document.getElementById("table");
  for (var i = 9, row; row = table.rows[i]; i--)
  {
      console.log(row.cells[0].innerHTML);
      //iterate through columns
      //columns would be accessed using the "col" variable assigned in the for loop 
  }
}

function checkBalances() {
  usersRef.once("value", function(snapshot) {
    var users = snapshot.val();
    for (let user in users)
    {
      // console.log(JSON.stringify(users));
      if (JSON.stringify(user) == sessionStorage.getItem("user"))
      {
        if (users[user].savings_amount > sessionStorage.getItem("savings_amount")) {
          sessionStorage.setItem("savings_amount", users[user].savings_amount);
          alert("Money was added into your savings account");
          break;
        }

        if (users[user].checking_amount > sessionStorage.getItem("checking_amount")) {
          sessionStorage.setItem("checking_amount", users[user].checking_amount);
          alert("Money was added into your checking account");
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
    window.location.href = "mainPage/mainPage.html";
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
    //console.log(amount);
    if (amount == NaN) {
      alert("Please put the amount of money you would like to send");
      return
    }

    
    if (username == "") {
      alert("Please put the username of the person you would like to send money to");
      return
    }
    
    if (username == sessionStorage.getItem("username")) {
      alert("Please do not put your username. Input another registered username");
      return;
    }

    var accountType = -1;
    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        accountType = radios[i];
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
    if (accountType == -1) {
      alert("Please select the type of account you would like to send money to");
      return;
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
    newBalanceTo = newBalanceTo.toFixed(2);
    if (amount > balanceFrom)
    {
      window.alert("The amount you want to send is greater than the amount you have in your account");
      return;
    }
    else 
    {
      newBalanceFrom = balanceFrom - amount;
      newBalanceFrom = newBalanceFrom.toFixed(2);
      sessionStorage.setItem(child, newBalanceFrom.toString());
      // console.log(newBalanceFrom);
    }
    firebase.database().ref("/Customers/" + user).child("savings_amount").set(newBalanceTo.toString());
    createTransaction(sessionStorage.getItem("username"), "Sent", users[user].name, amount.toFixed(2), getDate());
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
      newBalanceFrom = newBalanceFrom.toFixed(2);
      sessionStorage.setItem(child, newBalanceFrom.toString());
      // console.log(newBalanceFrom);
    }
    firebase.database().ref("/Customers/" + user).child("checking_amount").set(newBalanceTo.toString());
    createTransaction(sessionStorage.getItem("username"), "Sent", users[user].name, amount.toFixed(2), getDate());
    // console.log("success");
  }
  firebase.database().ref("/Customers/" + JSON.parse(sessionStorage.getItem("user"))).child(child).set(newBalanceFrom.toString());
  window.alert("Money sent! Please return to the front page to see your updated balances");
  // location.reload();
  createTransaction(users[user].username, "Received", sessionStorage.getItem("name"), amount.toFixed(2), getDate());
}

