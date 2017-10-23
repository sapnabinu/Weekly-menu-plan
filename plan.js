var eventdiv = null;
var spinWidget = null;
var curRows = 0;

Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

function makeCell(mealType, row) {
    var div = document.createElement("div");
    div.className = "demo-content";
    div.onclick = "showChoice(event)";
    div.id = mealType + ":" + row;
    div.innerHTML = "--choose--";

    var divWrap = document.createElement("div");
    divWrap.className = "col-md-3";
    divWrap.appendChild(div);
    return divWrap;
}

function makeDateCell(row) {
    var div = document.createElement("div");
    div.className = "demo-content";
    div.id = "DATE" + ":" + row;

    var rowDate = $("#datepicker").datepicker("getDate").addDays(row);
    div.innerHTML = $.datepicker.formatDate("yy-mm-dd", rowDate)

    var divWrap = document.createElement("div");
    divWrap.className = "col-md-3";
    divWrap.appendChild(div);
    return divWrap;
}

function makeRow(rowIndex) {
    var row = document.createElement("div");
    row.className = "row";
    row.id = "ROW:" + rowIndex;

    var date = makeDateCell(rowIndex);
    var bfst = makeCell("BFST", rowIndex);
    var lnch = makeCell("LNCH", rowIndex);
    var dnnr = makeCell("DNNR", rowIndex);

    row.appendChild(date);
    row.appendChild(bfst);
    row.appendChild(lnch);
    row.appendChild(dnnr);
    return row;
}

function generateRows() {
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

function showChoice(event) {
    eventdiv = event.target
    $("#recipedialog").dialog({ title: 'Choose A recipe'});

    $.get( "recipelist.html", 
	   function(recipeData) {
	       $("#recipedialog").html(recipeData );
           }, 'html')
}

function chooseRecipe(event) {
    eventdiv.innerHTML = event.target.dataset.rname;
    $("#recipedialog").dialog("close");
}

function saveMenu(event) {
    var postData = [];
    $("div[onclick*='showChoice']").each(function() {
	var typeRow = this.id.split(":");
	var mealType = typeRow[0];
	var mealRow = typeRow[1];
	var mealDate = $("#datepicker").datepicker("getDate");
	postData.push(["", mealType, mealDate, this.innerHTML])
    })
    
    var p = $.post("addplan", JSON.stringify(postData));
    p.done(function(data) { $("#planStatus").innerHTML = "saved"; });
}
