import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};


if (!MONGODB_URI) {
    new Error("Please define the MONGODB_URI in .env.local")
}

let cached = global.mongoose


if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;