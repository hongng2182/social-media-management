const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("twilio");

const app = express()
app.use(express.json())

app.use(cors({
    origin: [`${process.env.CORS_ORIGIN}`],
    credentials: true,
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Routes

app.use('/', require('./routes/index'));
app.use('/', require('./routes/dashboard'));




const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});