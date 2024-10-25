const pushNotificationController = require("../controller/push-notification.controller");


const express = require("express");
const router = express.Router();

router.get("/SendNotification", pushNotificationController.SendNotification)
router.post("/SendNotificationToDevices", pushNotificationController.SendNotificationToDevice);
router.post('/test-notification', pushNotificationController.sendTestNotification);


module.exports = router;