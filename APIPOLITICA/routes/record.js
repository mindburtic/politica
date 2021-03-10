const express = require("express");
const RecordsController = require("../controllers/recordsControllers");

const api = express.Router();

api.post("/record", RecordsController.addRecords);

module.exports = api;