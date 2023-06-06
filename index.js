require("dotenv").config()
const express = require("express")
const port = process.env.PORT || 3000
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');

// verify jwt token 
const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization
  if(!authorization) {
     return res.status(401).send({error: true, message: "unauthorized access"})
  }

  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.SECKRET_KEY, (error, decoded) => {
      if(error) {
         return res.status(401).send({error: true, message: "unauthorized access"})
      }
      req.decoded = decoded
      next()
  })
}


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
    const db = client.db("instro_learn_camp")
    const users_collection = db.collection("users")
    const instructors_collection = db.collection("instructors")
    const classes_collection = db.collection("classes")


    app.get("/", (req, res) => {
        res.send("camp is running")
    })
    app.post("/jwt", (req, res) => {
        const email = req.query.email
        const token = jwt.sign({
            email: email,
        }, process.env.SECKRET_KEY, { expiresIn: '10h' })
        res.send({token}) 
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