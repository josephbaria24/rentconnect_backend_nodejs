const express = require('express'); // Add this import
const router = express.Router(); 

// Endpoint to return the latest version and APK URL
router.get('/download/version', (req, res) => {
  const versionInfo = {
    latest_version: "1.0.8",
    download_url: "https://drive.google.com/uc?export=download&id=1A8X0KDhzi-S3-EaBGjFfA5iLP5dbcju8"
  };
  
  res.json(versionInfo);
});


module.exports = router;
