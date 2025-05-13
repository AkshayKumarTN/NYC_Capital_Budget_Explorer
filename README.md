# NYC_Capital_Budget_Explorer

A web-based platform that visualizes daily-updated budget data and incorporates user feedback, this project aims to foster accountability in government spending and create a more engaged citizenry.

## Project Preliquisite

1. Have the latest version of node.js and node package manager(npm) installed in your machine.
2. Have mongodb database installed in your machine will all its default settings.

## Steps for running the project on your local machine

```Bash
> git clone
> cd NYC_COUNCIL_CAPITAL_BUDGET_EXPLORER
> npm install 
> cd data-ingestion
> node index.js # This will download the NYC council budget data from 2019 to date
> cd ../    
> npm start
