var eventdiv = null;

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
