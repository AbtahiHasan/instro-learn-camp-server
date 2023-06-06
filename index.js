require("dotenv").config()
const express = require("express")
const port = process.env.PORT || 3000
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');




const uri = process.env.DB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    app.get("/", (req, res) => {
        res.send("camp is running")
    })
    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch(error) {
    console.log(error)
  }
}
run().catch(console.dir);






app.listen(port, () => {
    console.log(`this website running at ${port} `)
})