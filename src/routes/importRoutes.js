const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const upload = require('../middlewares/upload');

router.post('/members', upload.single('file'), importController.importMembers);

module.exports = router;