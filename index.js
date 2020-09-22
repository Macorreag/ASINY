const express = require("express")
var path = require("path")
const app = express()

app.use(express.static("public"))

app.listen(8080, () => {
  console.log("Server on port 8080")
})
