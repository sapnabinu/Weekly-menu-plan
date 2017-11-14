var eventdiv = null;
var spinWidget = null;
var curRows = 0;
var recipeList = null;
var planList = {};
var authCookie = null;
var userName = null;
var recipeNameTimeMap = {}

Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function menuplanSetup() {
    document.getElementById("menuinfo").onchange=startDateChange;
    $("#datepicker").datepicker({ onSelect: startDateChange } );
    $("#datepicker").datepicker("setDate", "0");
    
    spinWidget = $( "#spinner" ).spinner({ min: 3,
                                           max: 10,
                                           stop: function(event, ui) { generateRows();}
                                         });
    function assignRecipeList () {
        recipeList = JSON.parse(this.responseText);
	var entry;
	Object.keys(recipeList).forEach(function(lstName, ri) {
	    recipeList[lstName].forEach(function(recipe, i) {
		recipeNameTimeMap[recipe[0] + ":" + recipe[1]] = recipe;
	    });
	});
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", assignRecipeList);
    xhr.open("GET", "/getrecipes");
    xhr.send();
    generateRows();
};

function makeCell(mealType, row, mealDate) {
    var div = document.createElement("div");
    div.className = "demo-content";
    div.onclick = showChoice;
    div.id = "MEALCELL:" + mealType + ":" + row;

    var mealTag = mealType + ":" + mealDate;
    var planChoice = planList[mealTag];
    if (planChoice == null) {
        div.innerHTML = "--choose--";
    } else {
	var e = document.getElementById("menuinfo");
	var idx = e.options[e.selectedIndex].value;
	var recipe = recipeNameTimeMap[planChoice[3] + ":" + planChoice[1]];
        div.innerHTML = makeMealHtml(recipe);
    }

    var divWrap = document.createElement("div");
    divWrap.className = "col-md-3";
    divWrap.appendChild(div);
    return divWrap;
}

function makeDateCell(row, rowDate) {
    var div = document.createElement("div");
    div.className = "demo-content";
    div.id = "DATE" + ":" + row;
    div.innerHTML = rowDate;

    var divWrap = document.createElement("div");
    divWrap.className = "col-md-3";
    divWrap.appendChild(div);
    return divWrap;
}

function makeRow(rowIndex) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";
    rowDiv.id = "ROW:" + rowIndex;

    var rowDate = $("#datepicker").datepicker("getDate").addDays(rowIndex-1);
    rowDate = $.datepicker.formatDate("yy-mm-dd", rowDate);

    var date = makeDateCell(rowIndex, rowDate);
    var bfst = makeCell("BFST", rowIndex, rowDate);
    var lnch = makeCell("LNCH", rowIndex, rowDate);
    var dnnr = makeCell("DNNR", rowIndex, rowDate);

    rowDiv.appendChild(date);
    rowDiv.appendChild(bfst);
    rowDiv.appendChild(lnch);
    rowDiv.appendChild(dnnr);
    return rowDiv;
}

function generateRows() {
    function assignPlanList () {
        var plan = JSON.parse(this.responseText);
        planList = {}
        for (i=0; i < plan.length; i++) {
	    var mealType = plan[i][1];
	    var mealDate = plan[i][2];
            planList[mealType + ":" + mealDate] = plan[i];
        }
	onPlanFetch();
    }

    var dateObj = $("#datepicker").datepicker("getDate");
    var startDate = dateObj.toISOString().substring(0,10);
    var endDate = dateObj.addDays($("#spinner").spinner("value")).toISOString().substring(0,10);
        
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", assignPlanList);
    xhr.open("GET", "/getplan?startDate=" + startDate + "&endDate=" + endDate);
    xhr.send();
}

function onPlanFetch() {
    // First check whether to add, delete or do nothing
    var reqRows = $("#spinner").spinner("value")
    if (curRows == reqRows) {
        // do nothing
    } else if (curRows < reqRows) {
        // add rows
        for (var row=curRows; row < reqRows; row++) {
            document.getElementById("plancontainer").appendChild(makeRow(row+1));
        }
    } else {
        // delete rows
        for(var row=curRows; row>reqRows; row--) {
            var delDiv = document.getElementById("ROW:" + row);
            document.getElementById("plancontainer").removeChild(delDiv);
        }
    }
    curRows = reqRows;
}

function startDateChange() {
    for(var row=1; row <= curRows; row++) {
        var delDiv = document.getElementById("ROW:" + row);
        document.getElementById("plancontainer").removeChild(delDiv);
    }
    curRows = 0;
    onPlanFetch();
}

function makeRecipeDiv(mealTime, row) {
    var recipe = recipeList[mealTime][row];
    var div = document.createElement("div");
    div.onclick = chooseRecipe;
    div.dataset.recipe = JSON.stringify([mealTime, row]);
    div.innerHTML = recipe[0];

    var imgDiv = document.createElement("img");
    imgDiv.src = recipe[10];
    imgDiv.height = 50;
    imgDiv.width = 50;

    div.appendChild(imgDiv);
    return div;
}

function showChoice(event) {
    eventdiv = event.target;

    var dlgDiv = document.getElementById("recipedialog");
    while (dlgDiv.firstChild) {
        dlgDiv.removeChild(dlgDiv.firstChild);
    }

    var timeRow = eventdiv.id.split(":");
    var mealTime = timeRow[1];
    var planRow = timeRow[2];

    var recipeDiv = document.createElement("div");
    recipeDiv.id = "recipelist";
    recipeDiv.style.backgroundColor = "#eeeee0";

    var mealRecipe = recipeList[mealTime];
    for (var r=0; r<mealRecipe.length; r++) {
        recipeDiv.appendChild(makeRecipeDiv(mealTime, r));
    }

    dlgDiv.appendChild(recipeDiv);
    $("#recipedialog").dialog({ title: 'Choose A recipe'});
    $("#recipedialog").dialog('open');
}

function chooseRecipe(event) {
    var choice = JSON.parse(event.target.dataset.recipe);
    var mealList = recipeList[choice[0]];
    var recipe = mealList[choice[1]];

    var mealTime = eventdiv.id.split(":")[1];
    var row = eventdiv.id.split(":")[2];
    var mealDate = document.getElementById("DATE:" + row).innerHTML;
    planList[mealTime + ":" + mealDate] = ["", mealTime, mealDate, recipe[0]];

    eventdiv.innerHTML = makeMealHtml(recipe);
    eventdiv.style.backgroundColor = "salmon";
    $("#recipedialog").dialog("close");
}

function makeMealHtml(recipe) {
    var e = document.getElementById("menuinfo");
    var idx = e.options[e.selectedIndex].value;
    var idxType = e.options[e.selectedIndex].text;

    var text = recipe[0] + '<span class="small-font">' + "[" + idxType + ":" + recipe[idx] + ']</span>';

    return text;
}

function saveMenu(event) {
    var postData = [];
    $("div[id*='MEALCELL']").each(function() {
	if (this.style.backgroundColor == "salmon") {
            var mealTime = this.id.split(":")[1];
            var mealRow = this.id.split(":")[2];
            var mealDate = document.getElementById("DATE:"+mealRow).innerHTML;
            postData.push(planList[mealTime + ":" + mealDate]);
	    this.style.backgroundColor = "#dbdfe5";
        }
    })
    
    var p = $.post("addplan", JSON.stringify(postData));
    p.done(function(data) { $("#planStatus").innerHTML = "saved"; });
}

//##########Save new recipe
function addRecipe(event) {
    var postData = [];
    $("div[id*='MEALCELL']").each(function() {
	if (this.style.backgroundColor == "salmon") {
            var mealTime = this.id.split(":")[1];
            var mealRow = this.id.split(":")[2];
            var mealDate = document.getElementById("DATE:"+mealRow).innerHTML;
            postData.push(planList[mealTime + ":" + mealDate]);
	    this.style.backgroundColor = "#dbdfe5";
        }
    })
    
    var p = $.post("addplan", JSON.stringify(postData));
    p.done(function(data) { $("#planStatus").innerHTML = "saved"; });
}


// Login implementation.
// Frontend asks user for username and password. MD5 of password is generated
// and send to server along with user name to /login url. The server then md5
// encrypts the stored password and compares. If they match a cookie is generated,
// stored against the user name and send back to the frontend.
//
// Every other request must send this cookied back to the server. On logout the
// generated cookie is deleted on the server.

function login(event) {
    userName = document.getElementById("useremail").value
    var passWord = document.getElementById("password").value
    var passWordMd5 = md5(passWord)
    var xhr = new XMLHttpRequest();

    function loginResponse() {
	if (xhr.status == 200) {
            authcookie = JSON.parse(this.responseText)["authcookie"];
	    document.getElementById("useremail").style.display = "none";
	    document.getElementById("password").style.display = "none";
	    document.getElementById("loginbutton").style.display = "none";
	    document.getElementById("logoutbutton").style.display = "block";

	    document.cookie = "authcookie=" + authcookie +";path=/";
	} else {
	    alert("Login for " + userName + " failed" );
	}
    }

    xhr.open("POST", '/login', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.addEventListener("load", loginResponse);
    xhr.send(JSON.stringify({ "user": userName, "password": passWordMd5 }));
}

//###################################

function newuser(event) {
    var newuserName = document.getElementById("newemail").value
    var newpassWord = document.getElementById("newpassword").value
    var repeatPassword = document.getElementById("repeatpassword").value
    
    if(newpassWord != repeatPassword){
      alert("passwords do not match");
      return;
      }

    var xhr = new XMLHttpRequest();

    function newuserResponse(){
      if (xhr.status == 200) {
        alert("User added successfuly welcome  " + newuserName );
      }
      else{
        alert("User couldnot be added ");
      }
    }

    xhr.open("POST", '/newuser', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.addEventListener("load", newuserResponse);
    xhr.send(JSON.stringify({ "user": newuserName, "password": newpassWord}));
}

//##############################################

function logout(event) {
    function logoutResponse() {
	if (xhr.status == 200) {
	    document.getElementById("useremail").style.display = "block";
	    document.getElementById("password").style.display = "block";
	    document.getElementById("loginbutton").style.display = "block";
	    document.getElementById("logoutbutton").style.display = "none";	    

	    userName = null;
	    authcookie = null;
	    document.cookie = "authcookie=;path=/;";
	} else {
	    alert("Logout for " + userName + " failed" );
	}
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", logoutResponse);
    xhr.open("POST", "/logout");
    xhr.send(JSON.stringify({}));
}
