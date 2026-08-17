import { MongoClient } from "mongodb";

const uri =
  process.env.MONGO_URI ||
  "mongodb+srv://cherry-glow:shipon7878@cluster0.uoyoyb2.mongodb.net/cherry-glow-shop?appName=Cluster0";

const dbName = process.env.DB_NAME || "cherry_glow";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDatabase() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
