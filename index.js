require("dotenv").config()
const express = require("express")
const port = process.env.PORT || 3000
const app = express()
const jwt = require("jsonwebtoken")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors())
app.use(express.json())
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


    // verify admin 
    const verityAdmin = async (req, res, next) => {
      const email = req.decoded.email
      const user = await users_collection.findOne({email: email})
      if(user?.role !== "admin") {
          return res.status(401).send({error: true, message: "unauthorized access"})
      }
          next()
      
    }

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

    // checking authorization 
    app.get("/authorization", async (req, res) => {
      const email = req.query.email 
      const user = await users_collection.findOne({email: email})
      if(user) {
        res.send({role: user?.role}) 
      }
    })

    // users requests

    app.put("/add-user", async (req, res) => {
      const userData = req.body
      const email = req.query.email
      const filter = {
        email: email
      }
      const user = {
        $set: {
          name: userData?.name,
          email: userData?.email,
          photo_url: userData?.photo_url,
          role: "user"
        }
      }
      const options = { upsert: true };
      const result = await  users_collection.updateOne(filter, user, options)
      res.send(result)

    })

    // instructors requests 
    app.get("/instructors", async (req, res) => {
      const instructors = await instructors_collection.find().toArray()
      res.send(instructors)
    })

    // classes requests 
    app.get("/classes", async (req, res) => {
       const classStatus = req.query.status
       const classes = await classes_collection.find({status: classStatus}).toArray()
       res.send(classes)
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