var eventdiv = null;
var spinWidget = null;
var curRows = 0;
var recipeList = null;
planList = {};
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
    document.getElementById("typeofmeal").onchange=startDateChange;
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


function chooseMeal(mealType, typeofmeal) {
    var meals = recipeList[mealType];
    var recipe = null;
    var typeIndex = typeofmeal == "Low calorie" ? 9 : typeofmeal == "Kids meal" ? 7 : 8;

    var count = 60;
    while (count-- > 0) {
        for(var i=0; i<meals.length; i++) {
            recipe = meals[i];
            var rand = Math.round(Math.random() * 10);
            if (recipe[typeIndex] == 1 && rand == 7) {
                console.log("Returning", recipe, "for", mealType, typeofmeal);
                return recipe;
            }
        }
    }
    alert("No suitable recipe found for " + typeofmeal);
    return null;
}

function makeCell(mealType, row, mealDate, typeofmeal) {
    var div = document.createElement("div");
    div.className = "demo-content";
    div.onclick = showChoice;
    div.id = "MEALCELL:" + mealType + ":" + row;

    var mealTag = mealType + ":" + mealDate;
    var recipe;

    if (typeofmeal != "Type of Meal") {
        recipe = chooseMeal(mealType, typeofmeal);
        planList[mealType + ":" + mealDate] = ["", mealType, mealDate, recipe[0]];
        div.style.backgroundColor = "salmon";
    } else {
        var planChoice = planList[mealTag];
        if (planChoice == null) {
            recipe = null;
        } else {
            recipe = recipeNameTimeMap[planChoice[3] + ":" + planChoice[1]];
        }
    }
    
    div.innerHTML = makeMealHtml(recipe);

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

function makeRow(rowIndex, typeofmeal) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";
    rowDiv.id = "ROW:" + rowIndex;

    var rowDate = $("#datepicker").datepicker("getDate").addDays(rowIndex-1);
    rowDate = $.datepicker.formatDate("yy-mm-dd", rowDate);

    var date = makeDateCell(rowIndex, rowDate);
    var bfst = makeCell("BFST", rowIndex, rowDate, typeofmeal);
    var lnch = makeCell("LNCH", rowIndex, rowDate, typeofmeal);
    var dnnr = makeCell("DNNR", rowIndex, rowDate, typeofmeal);

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
    var e = document.getElementById("typeofmeal");
    var typeofmeal = e.options[e.selectedIndex].text;

    // First check whether to add, delete or do nothing
    var reqRows = $("#spinner").spinner("value")
    if (curRows == reqRows) {
        // do nothing
    } else if (curRows < reqRows) {
        // add rows
        for (var row=curRows; row < reqRows; row++) {
            document.getElementById("plancontainer").appendChild(makeRow(row+1, typeofmeal));
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
	
	var textDiv = document.createElement("div");
    textDiv.onclick = chooseRecipe;
    textDiv.dataset.recipe = JSON.stringify([mealTime, row]);
    textDiv.innerHTML = recipe[0];
	textDiv.style.cssFloat = "left";

    var img = document.createElement("img");
    img.src = recipe[10];
    img.height = 50;
    img.width = 50;
	img.style.cssFloat = "right";

	var clearDiv = document.createElement("div");
	clearDiv.style.clear = "both";
	
	div.appendChild(textDiv);
    div.appendChild(img);
	div.appendChild(clearDiv);
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
    if (recipe === null) {
        return "--choose--";
    }

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
    
    if (postData.length === 0) {
        alert("No recipes in plan, nothing to do");
        return;
    }
    
    var p = $.post("addplan", JSON.stringify(postData));
    p.done(function(data) { $("#planStatus").innerHTML = "saved"; });
}

//##########SAdd new recipe
function addRecipe(event) {
  
    var title = document.getElementById("title").value
    var description = document.getElementById("des").value
    var ingredients = document.getElementById("int").value
    var directions = document.getElementById("dir").value
    var time = document.getElementById("time").value
    var facts = document.getElementById("nutrition").value
    var quantity = document.getElementById("no").value
    var calorie = document.getElementById("calorie").value
    var cost = document.getElementById("cost").value
    
    
    if(title == "" || description =="" || ingredients == "" || directions == "" || time == "" || facts == "" || quantity == "" || calorie == "" || cost == ""){
      alert("Recipe cannot be added,Add data in all fields");
      return;
      }

    var xhr = new XMLHttpRequest();

    function newRecipeResponse(){
      if (xhr.status == 200){
        alert("Recipe added successfuly");
      }
      else{
        alert("Recipe could not be added ");
      }
    } 

    xhr.open("POST", '/addrecipe', true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.addEventListener("load", newRecipeResponse);
   
    xhr.send(JSON.stringify({"title" : title,"desc" : description,"ing" :ingredients,"dir": directions,"time" : time,"nutrients" : facts,"quantity" : quantity,"cal" : calorie,"price" : cost}));                        
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

function addCell(trElement, text, element) {
    var el = document.createElement(element);
    el.appendChild(document.createTextNode(text))
    trElement.appendChild(el);
}    

// Summary table required?
// { ingredient name => [ ingredient count, ingredient unit, recipe count ], ... }
// Ingredient Name, number of meals, number of people, total quantity, unit of measurement
function buildIngredientTable(ingredientList) {
    var page = ""
    var tbl = document.createElement("table");
    var peoplecount = document.getElementById("peoplecount").value;
    tbl.className = "ingredients";

    var tr = document.createElement('tr');
    addCell(tr, "Ingredient Name", "th")
    addCell(tr, "Number of meals", "th")
    addCell(tr, "Number of people", "th")
    addCell(tr, "Total quantity", "th")
    addCell(tr, "Unit", "th")
    tbl.appendChild(tr);

    page += sprintf("<span style='font: 400 18px courier;'>%-24s, %6s, %8s</h2><br/><hr/>",
                    "Ingredient Name", "Quantity", "Unit");
    var entry;
    var tr;
    Object.keys(ingredientList).forEach(function(ingredient, _index) {
        entry = ingredientList[ingredient];
        tr = document.createElement('tr');

        addCell(tr, ingredient, "td")
        addCell(tr, entry[2], "td")
        addCell(tr, peoplecount, "td")
        addCell(tr, peoplecount * entry[2], "td")
        addCell(tr, entry[1], "td")

        tbl.appendChild(tr);

        page += sprintf("<span style='font: 400 16px courier;'>%-24s, %6s, %8s</span><br>",
                        ingredient, peoplecount * entry[2], entry[1]);
    });

    return [tbl, page];
}


function showingredients(event) {
    // For each recipe count occurrence
    // For all each recipe get ingredients => [ recipe, ingredient, quantity, measure ]
    // Build ingredient -> count map
    recipeCountMap = {}
    var mealTime, mealRow, mealDate, recipe;
    $("div[id*='MEALCELL']").each(function() {
        if (this.innerHTML != "--choose--") {
            mealTime = this.id.split(":")[1];
            mealRow = this.id.split(":")[2];
            mealDate = document.getElementById("DATE:"+mealRow).innerHTML;
            recipe = planList[mealTime + ":" + mealDate][3];

            if (!(recipe in recipeCountMap)) {
                recipeCountMap[recipe] = 0;
            }
            recipeCountMap[recipe] += 1;
        }
    })

    if (Object.keys(recipeCountMap).length === 0) {
        alert("No recipes in plan, nothing to do");
        return;
    }
    
    function gotIngredients() {
        if (xhr.status == 200) {
            var recipeIngList = JSON.parse(this.responseText);
            var ingredientCountMap = {};

            // Each row is: recipe name, ingredient, quantity, measure
            recipeIngList.forEach(function(ingredientEntry, i) {
                recipeName = ingredientEntry[0];
                ingredientName = ingredientEntry[1];
                ingredientQuantity = ingredientEntry[2];

                if ( ! (ingredientName in ingredientCountMap)) {
                    // ingredient       =>               [ count, measure, recipe-count ]
                    ingredientCountMap[ingredientName] = [ 0, ingredientEntry[3], 0];
                }
                entry = ingredientCountMap[ingredientName];
                entry[0] += ingredientQuantity;
                entry[2] += recipeCountMap[recipeName];
            });

            var dlgDiv = document.getElementById("inglistdialog");
            while (dlgDiv.firstChild) {
                dlgDiv.removeChild(dlgDiv.firstChild);
            }

            var rval = buildIngredientTable(ingredientCountMap);
            var ingredientTable = rval[0];
            var printText = rval[1];
            var showIngDiv = document.createElement("div")
            showIngDiv.id = "ingredientTableDiv"

            if (event.id = "printingeredients") {
                var printDiv = document.createElement("div")
                printDiv.onclick = function() {
                    var originalContents = document.body.innerHTML;
                    document.body.innerHTML = printText;
                    window.print();
                    document.body.innerHTML = originalContents;
                    $("#inglistdialog").dialog('close');
                };
                printDiv.className = "div_hover";
                printDiv.height = 20;
                printDiv.appendChild(document.createTextNode("Print"));
                showIngDiv.appendChild(printDiv);
            }

            showIngDiv.appendChild(ingredientTable);
            dlgDiv.appendChild(showIngDiv);
            $("#inglistdialog").dialog({ title: 'Ingredients', height: 500, width: 600});
            $("#inglistdialog").dialog('open');
        } else {
            alert("Internal error: failed to fetch ingredient details from server" );
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", gotIngredients);
    xhr.open("POST", "/getingredients");
    xhr.send(JSON.stringify(Object.keys(recipeCountMap)));
}

function kidsMealClick(event) {
    var kidsmealdiv = document.getElementById("plancontainer");

    function kidsMealResponse() {
        if (xhr.status == 200) {
            kidsmealdiv.innerHTML = this.responseText;
        } else {
            alert("/getkidsmeal failed");
        }
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", kidsMealResponse);
    xhr.open("GET", "/kidsmeal");
    xhr.send();    
}

function hitext(event) {
    event.target.style.color = "orange";
}

function lowtext(event) {
    event.target.style.color = "black";
}
