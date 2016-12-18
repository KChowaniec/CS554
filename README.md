# CS554
Final Project: Matrix Movie Search

In-class technologies used:

1. React
2. Redis
3. Worker roles

Independent Technologies Used:

1. Highcharts (used in movie analytics)
2. Material UI

Setup instructions:

1. Run redis and mongodb
2. Server port and database configuration can be changed in all-config.json file
3. In data directory, run 'npm install' and then 'npm link'
4. In server directory, run 'npm install' and then 'npm link data'
5. In worker directory, run 'npm install' and then 'npm link data'
6. To seed database, run 'npm run seed' in data directory
7. After installs, run 'npm start' in server directory and also run 'node index.js' in worker directory 
8. To compile React code, run 'webpack' in server directory
9. When all is setup/running, open browser and navigate to http://localhost:3000 (port can be changed in all-config.json)
