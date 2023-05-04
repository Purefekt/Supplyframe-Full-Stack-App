const { response } = require("express");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require("axios").default;

// API KEYS
const YELP_API_KEY =
    "H2ckcPhI3zXZ6rasK0NGHswOf9JCf6YDne7GetsqnPBVnri3uM2-ZsehURtPhvjbfT62o3wqQKlcJ2fsd1bm3pvpkfwkeGiDV34Db6kiV8UQRNSbdjVhF0DVxcgqY3Yx";
const headers = { Authorization: `Bearer ${YELP_API_KEY}` };
const GOOGLE_API_KEY = "AIzaSyCJn6gE_Bu1c1hZ1CF7PDtijhqhKVpx33c";

// For CORS issue
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/main.html');
    // res.send("Veer's express server for SupplyFrame");
});

// /search_yelp?keyword=Pizza&distance=10&category=all&page_num=0&location=usc
app.get("/search_yelp", async (req, res) => {
    console.log("/search running...")

    const keyword = req.query.keyword;
    var distance = req.query.distance;
    const category = req.query.category;
    const page_num = req.query.page_num;
    const location = req.query.location;
    var lat;
    var lng;
    const limit = 5;

    // get the offset which is the page number * limit
    const offset = limit * parseInt(page_num)

    // convert miles distance into INT meters and if no distance was entered, set it to 10 miles (16093m)
    if (distance == "") {
        distance = 16093;
    } else {
        distance = parseInt(distance * 1609.344);
    }

    // get latitude and longitude of the location using google geocoding api
    try {
        var google_data = await axios
                .get(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${GOOGLE_API_KEY}`
                )
                .then((response) => response.data);
            lat = google_data["results"][0]["geometry"]["location"]["lat"];
            lng = google_data["results"][0]["geometry"]["location"]["lng"];
    } catch (error) {
        res.send(JSON.stringify([]));
        return;
    }

    console.log(`Keyword => ${keyword}`);
    console.log(`Distance in meters =>${distance}`);
    console.log(`Category => ${category}`);
    console.log(`Page number => ${page_num}`);
    console.log(`Offset => ${offset}`);
    console.log(`Location with Flag => ${location}`);
    console.log(`Latitude => ${lat}`);
    console.log(`Longitude => ${lng}`);

    // Get data from Yelp API
    try {
        var yelp_data_table = await axios
            .get(
                `https://api.yelp.com/v3/businesses/search?term=${keyword}&latitude=${lat}&longitude=${lng}&categories=${category}&radius=${distance}&limit=${limit}&offset=${offset}`,
                { headers: headers }
            )
            .then((response) => response.data.businesses);

        // need upto 10 results
        const num_results = Object.keys(yelp_data_table).length;
        // create the JSON object
        const data_table = [];
        for (let i = 0; i < num_results; i++) {
            var data_table_entry = new Object();
            data_table_entry.id = yelp_data_table[i]["id"];
            data_table_entry.index = i + 1;
            data_table_entry.image_url = yelp_data_table[i]["image_url"];
            data_table_entry.name = yelp_data_table[i]["name"];
            data_table_entry.rating = yelp_data_table[i]["rating"];
            data_table_entry.distance = Math.round(
                yelp_data_table[i]["distance"] / 1609.344
            );
            data_table.push(data_table_entry);
        }

        res.send(JSON.stringify(data_table));
    } catch (error) {
        res.send(JSON.stringify({"no_result": 1}));
        return;
    }
})

// /get_business_details?id=J7XaREYBkIiRlK2rnHNDXQ
app.get("/get_business_details", async (req, res) => {
    console.log("/get_business_details running...");

    const id = req.query.id;
    var categories = null;
    var phone = null;
    var status = null;
    var location = null;
    var name = null;
    var photo1 = null;
    var photo2 = null;
    var photo3 = null;
    var price = null;
    var url = null;

    try {
        // RUN YELP API BUSINESS DETAILS
        var business_details = await axios
            .get(`https://api.yelp.com/v3/businesses/${id}`, {
                headers: headers,
            })
            .then((response) => response.data);

        // error check for all fields
        if ("categories" in business_details) {
            categories = "";
            for (let i = 0; i < business_details["categories"].length; i++) {
                categories =
                    categories +
                    business_details["categories"][i]["title"] +
                    " | ";
            }
            categories = categories.substring(0, categories.length - 3);
        }
        if (categories == "") categories = null;

        if ("display_phone" in business_details) {
            phone = business_details["display_phone"];
            if (phone == "") phone = null;
        }

        if ("hours" in business_details) {
            if (business_details["hours"].length > 0) {
                if ("is_open_now" in business_details["hours"][0]) {
                    status = business_details["hours"][0]["is_open_now"];
                }
            }
        }

        if ("location" in business_details) {
            if ("display_address" in business_details["location"]) {
                location = "";
                for (
                    let i = 0;
                    i < business_details["location"]["display_address"].length;
                    i++
                ) {
                    location =
                        location +
                        business_details["location"]["display_address"][i] +
                        " ";
                }
                location = location.substring(0, location.length - 1);
                if (location == "") location = null;
            }
        }

        name = business_details["name"];

        if ("photos" in business_details) {
            const num_photos = business_details["photos"].length;
            if (num_photos == 1) photo1 = business_details["photos"][0];
            else if (num_photos == 2) {
                photo1 = business_details["photos"][0];
                photo2 = business_details["photos"][1];
            } else if (num_photos == 3) {
                photo1 = business_details["photos"][0];
                photo2 = business_details["photos"][1];
                photo3 = business_details["photos"][2];
            }
        }

        if ("price" in business_details) price = business_details["price"];

        if ("url" in business_details) url = business_details["url"];

        console.log(categories);
        console.log(phone);
        console.log(status);
        console.log(location);
        console.log(name);
        console.log(photo1);
        console.log(photo2);
        console.log(photo3);
        console.log(price);
        console.log(url);

        // add data to the final object
        var business_details_formatted = {};
        business_details_formatted.categories = categories;
        business_details_formatted.phone = phone;
        business_details_formatted.status = status;
        business_details_formatted.location = location;
        business_details_formatted.name = name;
        business_details_formatted.photo1 = photo1;
        business_details_formatted.photo2 = photo2;
        business_details_formatted.photo3 = photo3;
        business_details_formatted.price = price;
        business_details_formatted.url = url;

        res.send(JSON.stringify(business_details_formatted));
    } catch (error) {
        console.log(error);
        res.send(JSON.stringify([]));
        return;
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});