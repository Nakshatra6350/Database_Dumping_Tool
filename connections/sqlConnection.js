const { URL } = require("url");
const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const mysqldump = require("mysqldump");
const {
  sqlDir,
  successLogFunc,
  errorLogFunc,
} = require("../utils/directories.js");
const getTodayDate = require("../utils/getDateAndTime.js");

const sqlDumpFolder = sqlDir();
const successLog = successLogFunc();
const errorLog = errorLogFunc();

const sqlConnection = async (url, databaseType) => {
  const date = getTodayDate();
  const folderPath = `${sqlDumpFolder}/${date}`;

  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname;
  const user = parsedUrl.username;
  const password = parsedUrl.password;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: host,
      user: user,
      password: password,
    });

    await fs.mkdir(folderPath, { recursive: true });
    console.log(`Database folder created: ${folderPath}\n`);
    const [rows, fields] = await connection.execute(
      "SHOW DATABASES WHERE `Database` NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys') "
    );
    const databases = rows.map((row) => row.Database);
    console.log("Sql databases : ", databases);

    for (const database of databases) {
      console.log(`Dumping ${database} of ${databaseType}`);
      const [tableRows, tableFields] = await connection.execute(
        `SHOW TABLES IN \`${database}\``
      );
      const tables = tableRows.map((row) => Object.values(row)[0]);
      if (tables.length == 0) {
        console.log(
          `Database ${database} of ${databaseType} is empty. Skipping.`
        );
        fs.appendFile(successLog, `Database ${database} is empty. Skipping.\n`);
        continue;
      }
      await mysqldump({
        connection: {
          host: host,
          user: user,
          password: password,
          database: database,
        },
        dumpToFile: `${folderPath}/${databaseType}_${host}_${database}.sql`,
      });
      console.log(
        `Database ${database} of ${databaseType} dumped successfully`
      );

      await fs.appendFile(
        successLog,
        `${databaseType} : Database ${database} of host ${host} connected and dumped successfully\n`
      );
    }
  } catch (error) {
    if (error.code === "ER_EMPTY_QUERY") {
      console.error("Query was empty. Please provide a valid query.");
      await fs.appendFile(
        errorLog,
        `Error dumping database: ${error.message}\n`
      );
    } else {
      await fs.appendFile(
        errorLog,
        `Error dumping database: ${error.message}\n`
      );
      throw error;
    }
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
};

const genericConnection = async (folderPath, host, user, password, server) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: host,
      user: user,
      password: password,
    });
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`${server} Database folder created: ${folderPath}\n`);
    const [rows, fields] = await connection.execute(
      "SHOW DATABASES WHERE `Database` NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys') "
    );
    const databases = rows.map((row) => row.Database);
    console.log(`${server} databases : `, databases);

    for (const database of databases) {
      console.log(`Dumping ${database} of ${server}`);
      const [tableRows, tableFields] = await connection.execute(
        `SHOW TABLES IN \`${database}\``
      );
      const tables = tableRows.map((row) => Object.values(row)[0]);
      if (tables.length == 0) {
        console.log(`Database ${database} of ${server} is empty. Skipping.`);
        fs.appendFile(
          successLog,
          `${server} Database ${database} is empty. Skipping.\n`
        );
        continue;
      }
      await mysqldump({
        connection: {
          host: host,
          user: user,
          password: password,
          database: database,
        },
        dumpToFile: `${folderPath}/${server}${host}_${database}_${server}.sql`,
      });
      console.log(`Database ${database} of ${server} dumped successfully`);

      await fs.appendFile(
        successLog,
        `${server} : Database ${database} of host ${host} connected and dumped successfully\n`
      );
    }
  } catch (error) {
    console.error(`Error connecting to ${server} Database: ${error}`);
    fs.appendFile(errorLog, `Error connecting to prod database: ${error}\n`);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
};

module.exports = { sqlConnection, genericConnection };
