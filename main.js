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
            search_box_input(response);
        }
    }
}

function search_box_input(data) {
    var div_no_result = document.getElementById("no_result");
    var div_table = document.getElementById("data_table");

    var response = JSON.parse(data);

    // if no data, show no records found message and hide the table
    if (response.length == 0) {
        div_no_result.style.display = "block";
        div_table.style.display = "none";
    } else {
        // else hide no records found message and show and build the table
        div_no_result.style.display = "none";
        div_table.style.display = "block";
        
    }
}