const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb://comp3047-ass-1:pnkG9t3jFgNvBQ6Pfzm0jPtpjxkzJUDyeCnmtPHFpq98BRHlW7fnqM6w1mzoQ3CLnci0nvc0IaFlACDbV0K4lQ==@comp3047-ass-1.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@comp3047-ass-1@';

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('eventDB');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };