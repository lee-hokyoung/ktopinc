const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
  res.render('layout_test');
});

module.exports = router;