const express = require("express");
const router = express.Router();
const { verifyJWT, extractUserId } = require("../middleware/auth");
const JobDesc  = require("../models/JobDesc");
const mongoose = require("mongoose");

//allow user to upload profile photo, set contact info(phone and secondary email)
//maybe use google/github photo if signed in with OAuth

module.exports = router;