const { ONE_SIGNAL_CONFIG} = require("../config/app.config");
const pushNotificationService = require("../services/push-notification.services")


exports.SendNotification = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en: "Test Push Notification"},
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "Custom Notification"
        },
    };

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results,
        })
    })
};
exports.SendNotificationToDevice = (req, res, next) => {
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents: {en: "Test Push Notification"},
        included_segments: ["included_player_ids"],
        include_player_ids: req.body.devices,
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "Custom Notification"
        },
    };

    pushNotificationService.SendNotification(message, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results,
        })
    })
};

exports.sendTestNotification = async (req, res) => {
    try {
        const { userId, message } = req.body; // Expect `userId` and `message` in the request body

        await pushNotificationService.sendNotificationByUserId(userId, message);

        res.status(200).json({ status: true, message: 'Notification sent successfully!' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ status: false, error: 'Failed to send notification.' });
    }
};