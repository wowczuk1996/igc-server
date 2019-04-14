const express = require('express');
const router = express.Router();

const ApplicationController = require('../controller/applicationController');

router.post('/downloadUrl', ApplicationController.resources);

module.exports = router;

