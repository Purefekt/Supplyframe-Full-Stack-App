# Supplyframe-Full-Stack-App

## Run the project
- Make sure port 3000 is not being used.
- Clone this repository.
- Cd to the repository.
```
cd Supplyframe-Full-Stack-App
```
- Build the docker image. Make sure docker daemon is running.
```
docker build -t my-node-app .
```
- Run the app.
```
docker run -p 3000:3000 my-node-app
```
- Navigate to http://localhost:3000/.
- The application should be running.

## Test with Jest
- There are two tests to test the two API endpoints.
- Navigate to the container terminal.
```
npm test
```
- This will run the 2 tests.

## About the project
- I chose Yelp fusion API since i love this API and the amount of data it provides.
- The initial search form renders server side.
- A user can search for anything from Pizza to Skydiving, filter with distance, category and location and the application fetches all the relevant businesses using the Yelp fusion API.
- The location entered is converted to latitude and longitude using the Google Geocoding API.
- Each page shows 5 results. Pressing the next or previous buttons allow the user to navigate.
- Pressing the name of a business will reveal more details of the business below the table.
- The project is built with Bootstrap and is responsive. The mobile version looks good.