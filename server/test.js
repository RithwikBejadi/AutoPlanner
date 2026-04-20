const express = require("express");
const app = express();


app.post("/api/post-route", (req, res)=>{
    const {name, userid} = req.body
    res.status(201).send("hello world")
})

app.listen()