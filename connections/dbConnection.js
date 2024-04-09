const { MongoClient } = require("mongodb");
require("dotenv").config();

let databaseUrl = [];

const dbConnection = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.COLLECTION_NAME);
    const sqlCursor = collection.find({ dialect: { $exists: true } });
    const connectionStrings = await sqlCursor.toArray();

    for (let connection in connectionStrings) {
      const document = connectionStrings[connection];
      const key = document.key;
      databaseUrl.push(key);
    }
    const connections = databaseUrl;
    databaseUrl = [];
    console.log("connection strings : ", connections);
    return connections;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

const mongoConnection = async (server) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.COLLECTION_NAME);
    const document = await collection.findOne({ server: server });
    const uri = document.key;
    return uri;
  } catch (error) {
    console.log(
      "Error in connecting database for server: " + server + ", error : ",
      error
    );
  }
};

module.exports = { dbConnection, mongoConnection };
