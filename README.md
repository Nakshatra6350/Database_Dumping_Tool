MySQL Database Backup Automation
This Node.js script automates the backup of MySQL databases using mysqldump and node-cron. It creates a new backup folder for each backup containing the database dumps for 7 days and on 8 day the folder which is created on day 1 will be automatically deleted so that you will have backup of last 7 days and this process goes on and on and on.

Prerequisites
1. Node.js installed on your machine
2. MongoDB URI for fetching database connection details
3. MySQL database connection details

MongoDocument structure : {
  "_id": {
    "$oid": "66054655487d617460b525e8"
  },
  "key": "YOUR_CONNECTION_STRING",
  "dialect": "YOUR_DATABASE_TYPE",
  "server": "YOUR_SERVER_NAME"
}

Usage
1. The script will run every day at 12:00 AM (00:00 IST) and create a new backup folder for each database backup.
2. You can also make dump of a particular databases by running this script and hitting the endpoint "http://localhost:8000/server/YOUR_SERVER_NAME, it will automatically to the database connection string present in your mongo document.
3. If your connection string is not present in database you can still make dumps of it by passing it to endpoint "http://localhost:8000/server/YOUR_SERVER_NAME/YOUR_CONNECTION_STRING.

Note
1. Update your MongoDB URI in .env file: Replace "your_mongodb_uri" with your actual MongoDB URI.
2. Update your Database name in .env file: Replace "your_db_name" with your actual MongoDB Database Name.
3. Update your Collection name in .env file: Replace "your_collection_name" with your actual MongoDB Collection Name.
4. Install necessary packages: Make sure to install all necessary packages by running npm install.
5. Change your scheduling by changing the cron expression ("0 0 * * *"): Modify the cron expression in index.js to change the backup scheduling.
