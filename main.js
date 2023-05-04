const SERVER = "http://127.0.0.1:8888"

function search_yelp(inp_keyword, inp_distance, inp_category, inp_page_num, inp_location) {
    const keyword = inp_keyword;
    const distance = inp_distance;
    const category = inp_category;
    const page_num = inp_page_num;
    const location = inp_location;

    var request = new XMLHttpRequest();
    api_string = SERVER + "/search_yelp?keyword=" + keyword + "&distance=" +distance + "&category=" + category + "&page_num=" + page_num + "&location=" + location;
    request.open("GET", api_string);
    request.send();

    request.onload = function () {
        if (request.status === 200) {
            response = request.responseText;
            console.log(response)
            search_box_input(response, keyword, distance, category, page_num, location);
        }
    }
}

function search_box_input(data, keyword, distance, category, page_num, location) {
    var div_no_result = document.getElementById("no_result");
    var div_table = document.getElementById("data_table_container");

    var response = JSON.parse(data);

    // if no data, show no records found message and hide the table
    if (response.length == 0) {
        div_no_result.style.display = "block";
        div_table.style.display = "none";
    } else {
        // else hide no records found message and show and build the table
        div_no_result.style.display = "none";
        div_table.style.display = "block";
        build_table(response, keyword, distance, category, page_num, location);
    }
}

function build_table(data, keyword, distance, category, page_num, location) {

    var table = document.getElementById("data_table");
    var pagination = document.getElementById("pagination")

    // reset table on every call
    table.innerHTML = "<thead><tr><th scope='col' class='text-center'>Image</th><th scope='col' class='text-center'>Name</th><th scope='col' class='text-center'>Rating</th><th scope='col' class='text-center'>Distance</th></tr></thead>"

    // build table rows based on number of results
    num_results = data.length;
    for (var i=0; i<num_results; i++) {
        var id = data[i]["id"];
        var name = data[i]["name"];
        var image_url = data[i]["image_url"];
        var rating = data[i]["rating"];
        var distance = data[i]["distance"];
        var count = i + 1;

        var new_row = document.createElement("tr");
        new_row.innerHTML = "<td><img class='img-fluid' style='max-height: 100px; max-width: 100px;'  src='" + image_url + "'></td><td class='text-center'>" + name + "</td><td class='text-center'>" + rating + "</td><td class='text-center'>" + distance + "</td>";

        table.appendChild(new_row);
    }

    // pagination bar. If it is the first page, keep Previous disabled. If we dont have results for next page, keep Next disabled.
    var pagination_ul = document.createElement("ul");
    pagination_ul.setAttribute("class", "pagination");
    pagination.appendChild(pagination_ul)

    const previous_li = document.createElement("li");
    if (page_num == 0) {
        previous_li.setAttribute("class", "page-item disabled");
        
        const span = document.createElement("span");
        span.setAttribute("class", "page-link");
        span.textContent = "Previous";
        
        previous_li.appendChild(span);
    } else {
        previous_li.setAttribute("class", "page-item");
        
        const span = document.createElement("span");
        span.setAttribute("class", "page-link");
        span.textContent = "Previous";
        
        previous_li.appendChild(span);
    }
    pagination_ul.appendChild(previous_li)

    var page_x_of_y_li = document.createElement("li");
    page_x_of_y_li.innerHTML = "<li class='page-item disabled'><span class='page-link'>Page " + `${page_num+1}` + "</span></li>"
    pagination_ul.appendChild(page_x_of_y_li)

    const next_li = document.createElement("li");
    next_li.setAttribute("class", "page-item");
    const span = document.createElement("span");
    span.setAttribute("class", "page-link");
    span.textContent = "Next";
    next_li.appendChild(span);
    pagination_ul.appendChild(next_li);



    window.localStorage.href = "#data_table_container";


}