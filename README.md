**Group**: Paper Airplanes

**Project**: DopAt

**Description**: A website where professors, or club leaders, can take attendance in their classes and events. The first of it's kind.

---

## Available Students

Email: examplestudent@dopat.com
Password: dopat

Email: alphonce@buffalo.edu
Password: password1

## Available Professors

Email: mhertz@buffalo.edu
Password: 123

Email: atri@buffalo.edu
Password: algos

## Changelog - Sprint 3

**Added**

1. Google Account login
2. Privacy Policy
3. Monetization - Ads
4. Pro Accounts (Removes the Ads if you pay) ;)
5. Professor View Attendance
6. Professor Get Attendance Data
7. Professor Create and Start Quiz Pages
8. Student View and Take Quiz Pages
9. Student & Professor Delete Account Buttons
10. Native Emoji Support

**Removed**

1. TopHat from the market
 
---

## How to Run

1. Install node & npm on your machine
2. Install MongoDB on your machine
3. Navigate to the project root directory
4. Run
```
npm install
```
 in a terminal (or equivalent on other OS's)
4. You should see a node_modules folder appear with a bunch of stuff inside it
5. Copy the .env file into the project root folder. This gives you the Google API Keys
6. Start MongoDB running locally on http://localhost:27017
7. In a terminal inside the project root folder run
```
node server.js
```
6. Navigate to http://localhost:4444 and you should see the homepage for DopAt

#### (Alternative) Run With Docker
1. Install Docker & Docker Compose
2. Clone the repository
3. Checkout branch feature/docker-environment
4. [If .env not in project root] Copy the .env file into the project root folder. This gives you the Google API Keys
5. Navigate to project root and build the custom Dopat docker image
```
docker build -t dopat/node .
```
5. Run the docker-compose file that will start both NodeJS and MongoDB containers
```
docker-compose up -d
```
6. View the site on http://localhost:4444

---

## Project Structure
```
project root
├── .env                   - Google Auth API Key and ClientID
├── docker-compose.yml     - Docker Compose file with NodeJS & MongoDB
├── Dockerfile             - Dockerfile for custom NodeJS container
├── functions/             - Folder for small helper JS functions
├── logs/                  - Folder for log files and logging functions
├── models/                - Folder for MongoDB database models
├── node_modules/          - node_modules folder, full of package dependencies
├── package.json           - Contains a package list for installing with NPM
├── package-lock.json      - Package versions we're using
├── public/                - Contains static HTML, CSS, JS, Image files
├── README.md              - The readme file with documentation in it
├── routes/                - Route files. Grouped routes with common functionality
├── server.js              - The NodeJS server configuration file
└── views/                 - Handlebars HTML template and page files
```
