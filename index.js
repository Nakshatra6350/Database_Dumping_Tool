const cron = require("node-cron");
const { dbConnection } = require("./connections/dbConnection.js");
const { sqlConnection } = require("./connections/sqlConnection.js");
const postgresConnection = require("./connections/postgresConnection.js");
const {
  deleteFolderSql,
  deleteFolderPostgres,
} = require("./utils/deleteFolder.js");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const serverRoute = require("./routes/serverRoute.js");
dotenv.config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
//comment dev
app.use("/server", serverRoute);
app.get("/Utility/health", (req, res) => {
  try {
    res.status(200).json({
      message: "Server is running",
    });
  } catch (error) {
    res.status(500).json({ message: "Server is not running", error });
  }
});
const runapp = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.log("Error connecting database : ", error);
  }
};
runapp();

cron.schedule(
  "0 0 * * *",
  async () => {
    async function connection() {
      const databaseUrls = await dbConnection();

      for (const url of databaseUrls) {
        const parts = url.split("://");
        const databaseType = parts[0];
        String(databaseType);
        if (databaseType === "mysql") {
          await sqlConnection(url, databaseType);
        }
        if (databaseType === "postgresql") {
          await postgresConnection(url, databaseType);
        }
      }
    }

    async function deleteFolders() {
      try {
        await deleteFolderSql();
        await deleteFolderPostgres();
      } catch (error) {
        console.log("Error in deleting folders : ", error);
      }
    }

    await connection();
    await deleteFolders();
  },
  {
    timezone: "Asia/Kolkata",
  }
);
