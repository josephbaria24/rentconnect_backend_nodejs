const express = require('express'); // Add this import
const router = express.Router(); 

// Endpoint to return the latest version and APK URL
router.get('/download/version', (req, res) => {
  const versionInfo = {
    latest_version: "1.0.1", // Update this whenever you release a new version
    download_url: "https://drive.google.com/file/d/1P2tPlp8TpVQwkTBfBlHMjfpCulP4KRVP/view?usp=drive_link" // URL of your APK file
  };
  
  res.json(versionInfo);
});


module.exports = router;
