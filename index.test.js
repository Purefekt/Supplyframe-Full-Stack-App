const axios = require('axios');
const SERVER = "http://127.0.0.1:3000"

test('fetches data from the search API', async () => {

    api_string = SERVER + "/search_yelp?keyword=Pizza&distance=10&category=all&page_num=0&location=usc"
    const response = await axios.get(api_string);
    expect(response.status).toEqual(200);
    expect(response.data).toBeDefined();
});

test('fetches data from the business details API', async () => {

    api_string = SERVER + "/get_business_details?id=J7XaREYBkIiRlK2rnHNDXQ"
    const response = await axios.get(api_string);
    expect(response.status).toEqual(200);
    expect(response.data).toBeDefined();
});