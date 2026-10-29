import 'dotenv/config'
const mongoose = require("mongoose");
import express from "express";
const express = require("express");
const userRoutes = require("./routes/userRoutes");



const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/myapp")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


const uri = process.env.MONGODB_URI

if (!uri) {
throw new Error('MONGODB_URI is missing from .env')
}

async function main() {
await mongoose.connect(uri)

console.log('Connected to MongoDB Atlas')
console.log('Database:', mongoose.connection.name)
console.log('Host:', mongoose.connection.host)



await mongoose.disconnect()
console.log('Disconnected cleanly')
}

main().catch((error) => {
console.error('Connection failed:', error.message)
process.exit(1)
})