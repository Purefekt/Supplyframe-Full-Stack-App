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
            search_box_input(response, keyword, distance, category, page_num, location);
        }
    }
}

function search_box_input(data, keyword, distance, category, page_num, location) {
    var div_no_result = document.getElementById("no_result");
    var div_table = document.getElementById("data_table_container");
    var business_info_div = document.getElementById("business_info");

    var response = JSON.parse(data);

    // do not show business info
    business_info_div.innerHTML = "";
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
        new_row.innerHTML = "<td><img class='img-fluid' style='max-height: 100px; max-width: 100px;'  src='" + image_url + "'></td><td class='text-center'><button type='button' class='btn btn-success' id='result_id' title='" + id + "'>" + name + "</button></td><td class='text-center'>" + rating + "</td><td class='text-center'>" + distance + "</td>";

        table.appendChild(new_row);
    }

    // clicking the button will send the id to Yelp and get more info on that business
    var click_results = document.querySelectorAll("#result_id");

    for (var i = 0; i < click_results.length; i++) {
        click_results[i].addEventListener("click", function (e) {
            get_business_details(e.currentTarget.getAttribute("title"));
        });
    }

    const cur_page = parseInt(page_num) + 1
    // pagination bar. If it is the first page, keep Previous disabled. If we dont have results for next page, keep Next disabled.
    pagination.innerHTML = ""
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
        span.setAttribute("onclick", `search_yelp("${keyword}", "${distance}", "${category}", "${parseInt(page_num)-1}", "${location}")`);
        span.textContent = "Previous";
        
        previous_li.appendChild(span);
    }
    pagination_ul.appendChild(previous_li)

    var page_x_of_y_li = document.createElement("li");
    page_x_of_y_li.innerHTML = "<li class='page-item disabled'><span class='page-link'>Page " + `${cur_page}` + "</span></li>"
    pagination_ul.appendChild(page_x_of_y_li)

    const next_li = document.createElement("li");
    next_li.setAttribute("class", "page-item");
    const span = document.createElement("span");
    span.setAttribute("class", "page-link");
    span.setAttribute("onclick", `search_yelp("${keyword}", "${distance}", "${category}", "${parseInt(page_num)+1}", "${location}")`);
    span.textContent = "Next";
    next_li.appendChild(span);
    pagination_ul.appendChild(next_li);

    window.localStorage.href = "#data_table_container";

}

function get_business_details(id) {
    var request = new XMLHttpRequest();

    api_string = SERVER + "/get_business_details?id=" + id;
    request.open("GET", api_string);
    request.send();

    request.onload = function () {
        if (request.status == 200) {
            response = request.responseText;
            console.log(response);
            build_business_info(response);
        }
    };
    return true;
}

function build_business_info(response) {
    // get the api data
    var business_data = JSON.parse(response);

    var name = business_data["name"];
    var status = business_data["status"];
    var category = business_data["categories"];
    var address = business_data["location"];
    var phone_number = business_data["phone"];
    var price = business_data["price"];
    var more_info = business_data["url"];
    var photo1 = business_data["photo1"];
    var photo2 = business_data["photo2"];
    var photo3 = business_data["photo3"];

    var business_info_div = document.getElementById("business_info");
    business_info_div.style.display = "block";
    business_info_div.innerHTML = "";

    var info_name = "<h4 class='text-center mt-3'>" + name +"</h4><div class='dropdown-divider'></div>";
    var status_category = "";
    if (status == true) {
        status_category = "<div class='row'><div class='col'><h5>Status</h5><div class='alert alert-success w-50 text-center' role='alert'>Open</div> </div><div class='col'><h5>Category</h5><p>" + category + "</p></div></div>"
    } else {
        status_category = "<div class='row'><div class='col'><h5>Status</h5><div class='alert alert-danger w-50 text-center' role='alert'>Closed</div> </div><div class='col'><h5>Category</h5><p>" + category + "</p></div></div>"
    }
    var address_phone = "<div class='dropdown-divider'></div><div class='row'><div class='col'><h5>Address</h5><p>" + address + "</p></div><div class='col'><h5>Phone Number</h5><p></p>" + phone_number + "</p></div></div>"
    var price_more_info = "<div class='dropdown-divider'></div><div class='row'><div class='col'><h5>Price</h5><p>" + price + "</p></div><div class='col'><h5>More info</h5><a class='a_business_details_more_info_sub' href='" + more_info + "' target='_blank'>Yelp</a></div></div>"
    var photos = "<div class='dropdown-divider'></div><div class='row mb-3'><div class='col border'><img class='img-fluid' style='max-height: 400px;' src='" + photo1 + "'></div><div class='col border'><img class='img-fluid' style='max-height: 400px;' src='" + photo2 + "'></div><div class='col border'><img class='img-fluid' style='max-height: 400px;' src='" + photo3 + "'></div></div>"

    var busines_info_element = document.createElement("div");
    busines_info_element.innerHTML = info_name + status_category + address_phone + price_more_info + photos;

    business_info_div.appendChild(busines_info_element);

    window.location.href = "#business_info";
}

// CLEAR BUTTON functionality
function implement_clear() {
    document.getElementById("form").reset();
    document.getElementById("no_result").style.display = "none";
    document.getElementById("data_table_container").style.display = "none";
    document.getElementById("business_info").style.display =
        "none";

}