# NYC_Capital_Budget_Explorer

A web-based platform that visualizes daily-updated budget data and incorporates user feedback, this project aims to foster accountability in government spending and create a more engaged citizenry.

## Project Preliquisite

1. Have the latest version of node.js and node package manager(npm) installed in your machine.
2. Have mongodb database installed in your machine will all its default settings.


## Team Members

- Badri Narayanan Rajendran  (CWID: 20030350)
- Emmanuel Okoro  (CWID: 20030965)
- Vishal Rathod (CWID: 20033033)
- Akshay Kumar Talur Narasimmulu (CWID: 20032052)

## Steps for running the project on your local machine

```Bash
> git clone
> cd NYC_COUNCIL_CAPITAL_BUDGET_EXPLORER
> npm install 
> cd data-ingestion
> node index.js # This will download the NYC council budget data from 2019 to date
> cd ../    
> npm start
```


## Add the following config to send verification email for forgot-password

```.env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS="your_google_account_app_password"
```

### You can follow this page for creating app password for google account.
https://support.google.com/accounts/answer/185833?hl=en

### After navigating to the App Password page for your google account follow the below steps:
1. Add App Name
2. Click Create button

After following the above steps your app password for the google account will be created,
and you can use them in the .env file as configuration in the above provided format.

### Note: The app password should belong to the corresponding google account email.