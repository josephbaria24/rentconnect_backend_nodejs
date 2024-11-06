const express = require('express'); // Add this import
const router = express.Router(); 

// Endpoint to return the latest version and APK URL
router.get('/download/version', (req, res) => {
  const versionInfo = {
    latest_version: "1.0.2", // Update this whenever you release a new version
    download_url: "https://drive.google.com/uc?export=download&id=1P2tPlp8TpVQwkTBfBlHMjfpCulP4KRVP"
  };
  
  res.json(versionInfo);
});


module.exports = router;
