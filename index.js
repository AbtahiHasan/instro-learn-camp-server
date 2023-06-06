const express = require("express")
require("dotenv").config()
const port = process.env.PORT || 3000
const app = express()

app.get("/", (req, res) => {
    res.send("camp is running")
})


app.listen(port, () => {
    console.log(`this website running at ${port} `)
})