const { Client } = require("pg");
const {exec} = require('child_process')
const fs = require("fs");
const { postgresDir, successLogFunc, errorLogFunc } = require("../utils/directories");
const getTodayDate = require("../utils/getDateAndTime");

const postgresDumpFolder = postgresDir();
const successLog = successLogFunc();
const errorLog = errorLogFunc();

const dumpDatabase = async (connectionString, databaseName, outputFile) => {
  try {
    const command = `pg_dump "${connectionString}"/"${databaseName}" > "${outputFile}"`;
    await execCommand(command);
  } catch (error) {
    console.error(`Error dumping database ${databaseName}:`, error);
    fs.appendFile(errorLog, `Error dumping database ${databaseName}: ${error}\n`);
    throw error;
  }
};

const execCommand = async (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(new Error(stderr));
        return;
      }
      resolve(stdout);
    });
  });
};

const postgresConnection = async (connectionString, databaseType) => {
  const date = getTodayDate();
  const folderPath = `${postgresDumpFolder}/${date}`;
  
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      console.log(`Database folder created: ${folderPath}`);
    }
    
    const client = new Client({
      connectionString: connectionString,
    });
    await client.connect();
    
    const query = "SELECT datname FROM pg_database WHERE datistemplate = false ;";
    const result = await client.query(query);

    const databases = result.rows.map(row => row.datname);
    console.log('Postgres databases:', databases);

    for (const databaseName of databases) {
      const outputFile = `${folderPath}/${databaseType}_${databaseName}.sql`;
      console.log(`Dumping ${databaseName} of ${databaseType}`);
      await dumpDatabase(connectionString, databaseName, outputFile);
      console.log(`Database ${databaseName} of ${databaseType} dumped successfully`);

      fs.appendFile(
        successLog,
        `${databaseType} : Database ${databaseName} connected and dumped successfully\n`
      );
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error);
    fs.appendFile(errorLog, `Error dumping databases: ${error.message}\n`);
    throw error;
  }
};

module.exports = postgresConnection;
