const { mongoConnection } = require("../connections/dbConnection.js");
const { URL } = require("url");
const { serverDir } = require("../utils/directories.js");
const getTodayDate = require("../utils/getDateAndTime.js");
const { genericConnection } = require("../connections/sqlConnection.js");

const serverController = async (req, res) => {
  try {
    const server = req.params.server;
    const date = getTodayDate();
    const serverFolder = serverDir(server);
    const folderPath = `${serverFolder}/${date}`;
    const databaseUrl = await mongoConnection(server);
    console.log("Api hit the URL :", databaseUrl);
    const parsedUrl = new URL(databaseUrl);
    const host = parsedUrl.hostname;
    const user = parsedUrl.username;
    const password = parsedUrl.password;
    console.log(
      `${server} credentials: \n` +
        " host : " +
        host +
        "\n user : " +
        user +
        "\n password : " +
        password +
        "\n server : " +
        server
    );
    await genericConnection(folderPath, host, user, password, server);
    res.status(200).json({ urls: databaseUrl });
  } catch (error) {
    console.error("Error in Server Controller:", error);
    res.status(500).send("Internal Server Error");
  }
};

const linkController = async (req, res) => {
  try {
    const connectionLink = req.params.link;
    const date = getTodayDate();
    const server = req.params.serverType;
    const serverFolder = serverDir(server);
    const folderPath = `${serverFolder}/${date}_byLink`;

    console.log("Api hit the URL with string in endpoint :", connectionLink);
    const parsedUrl = new URL(connectionLink);
    const host = parsedUrl.hostname;
    const user = parsedUrl.username;
    const password = parsedUrl.password;
    console.log(
      `${server} credentials: \n` +
        " host : " +
        host +
        "\n user : " +
        user +
        "\n password : " +
        password +
        "\n server : " +
        server
    );
    await genericConnection(folderPath, host, user, password, server);
    res.status(200).json({ url: connectionLink });
  } catch (error) {
    console.log("Link controller error : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { serverController, linkController };
