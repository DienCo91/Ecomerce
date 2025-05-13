const router = require('express').Router();
const apiRoutes = require('./api');
const admin = require("firebase-admin");

const keys = require('../config/keys');
const serviceAccount = require("../constants/adminFirebase.json");
const { apiURL } = keys.app;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const api = `/${apiURL}`;

// api routes
router.use(api, apiRoutes);
router.use(api, (req, res) => res.status(404).json('No API route found'));

module.exports = router;
