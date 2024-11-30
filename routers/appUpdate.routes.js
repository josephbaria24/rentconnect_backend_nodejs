const express = require('express'); // Add this import
const router = express.Router(); 

// Endpoint to return the latest version and APK URL
router.get('/download/version', (req, res) => {
  const versionInfo = {
    latest_version: "1.0.16",
    download_url: "https://drive.google.com/uc?export=download&id=1mwCGWnIvpURlijoA6rLLYRD3tGF7iCev"
  };
  
  res.json(versionInfo);
});


module.exports = router;
