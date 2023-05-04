const { response } = require("express");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8888;
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

app.get("/", (req, res) => {
    res.send("Veer's express server for SupplyFrame");
});

// /search?form_keyword=pizza&form_distance=10&form_category=all&form_location=USC&page_num=0
app.get("/search_yelp", async (req, res) => {
    console.log("/search running")

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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});