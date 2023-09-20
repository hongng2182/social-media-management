const { saveAccessCode, getAccessCode, clearAccessCode } = require('../config/firebase')
const { generateNewAccesCode } = require('../utils')
const express = require("express");

const router = express.Router();

router.post('/CreateNewAccessCode', async (req, res) => {
    const { phoneNumber } = req.body

    // Check valid input
    if (!phoneNumber) {
        res.status(400).json({
            error: "Invalid input",
        })
    }

    // generate random code
    const randomCode = generateNewAccesCode()

    //save code to phoneNumber firebase db
    saveAccessCode(phoneNumber, randomCode)

    // set up Twilio SMS messaging service
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    // send SMS message
    client.messages
        .create({
            body: `Your SOCIALSYNC verification code is: ${randomCode}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+${phoneNumber}`
        })
        // if (sendSuccess) return 6-digit access code
        .then(message => {
            res.status(200).json({
                success: true,
                message: `${phoneNumber}`
            })
            console.log("SMS send success", message.sid)
            return randomCode
        })
        // if (error) return error
        .catch(error => {
            console.log(error)
            res.status(500).json({
                message: "Error sending OTP. Please try again.",
            })
        })
})

router.post('/ValidateAccessCode', async (req, res) => {
    const { accessCode, phoneNumber } = req.body

    // check invalid  input
    if (!accessCode || !phoneNumber) {
        return res.status(500).json({
            error: "Invalid input",
        })
    }

    // check accesscode equal to db accesscode
    const accessCodeFromDb = await getAccessCode(phoneNumber)

    const isEqual = accessCode == accessCodeFromDb

    if (isEqual) {
        // set accessCode empty in db
        clearAccessCode(phoneNumber)
        return res.status(200).json({ success: true })
    } else {
        res.status(500).json({
            message: "Invalid OTP. Please try again.",
        })
    }

})

module.exports = router;