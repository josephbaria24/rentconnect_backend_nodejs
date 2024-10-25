const { json } = require('body-parser');
const { ONE_SIGNAL_CONFIG } = require('../config/app.config');
const https = require("https");
const UserModel = require("../models/user.model")


async function SendNotification(data, callback) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Basic " + ONE_SIGNAL_CONFIG.API_KEY,
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    var https = require("https");
    var req = https.request(options, function(res) {
        res.on("data", function(data) {
            console.log(JSON.parse(data));

            return callback(null, JSON.parse(data));
        });
    });


    req.on("error", function(e) {
        return callback({
            message: e
        })
    });

    req.write(JSON.stringify(data));
    req.end();
}


 async function sendNotificationByUserId(userId, message) {
    try {
        // Find user and get player_id
        const user = await UserModel.findById(userId);
        if (!user || !user.player_id) {
            throw new Error('User or player_id not found');
        }

        // Define notification payload
        const notificationPayload = {
            app_id: ONE_SIGNAL_CONFIG.APP_ID,
            include_player_ids: [user.player_id],
            contents: { en: message },
        };

        // Send notification and handle callback
        return new Promise((resolve, reject) => {
            SendNotification(notificationPayload, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

module.exports = {
    SendNotification,
    sendNotificationByUserId
}