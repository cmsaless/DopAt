function clearlink() {
    // clearing out classID input
    document.getElementById('classID').value = '';
}

function search() {
    var searchInput = document.getElementById('classID').value;
    var searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = "";
    var errorMessage = document.getElementById("error-message");
    


    var table = document.createElement("table");
    table.classList.add("table");

    // fetch from db
    fetch('/register/'+ searchInput)
        .then(response => response.json())
        .then(json => {
            console.log(json)
            // check if json returned is not array (means we have not gotten valid search results returned)
            if (!Array.isArray(json)) {
                errorMessage.classList.remove("hidden");
                return;
            }
            // check if error message on page
            if (!errorMessage.classList.contains("hidden")) {
                errorMessage.classList.add("hidden");
            }
            // create elements to display search results on page
            json.forEach(element => {
                var row = document.createElement("tr");
                var td = document.createElement("td");
                var td2 = document.createElement("td");
                var b = document.createElement("button");
                var link = document.createElement("a");
                link.setAttribute("href", "/student/add/"+ element._id);
                b.className = "btn btn-primary";
                b.innerHTML = "Join";
                // display class name and professor name
                td.innerHTML = element.name;
                td2.innerHTML = element.professor.name;
    
                row.appendChild(td);
                row.appendChild(td2);
                link.appendChild(b);
                row.appendChild(link);
                table.appendChild(row);
    
                searchResult.appendChild(table);
            })
            console.log(json);
        });

}