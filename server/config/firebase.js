const admin = require("firebase-admin");
require("dotenv").config();

// Fetch the service account key JSON file contents
var serviceAccount = require("../config/firebase-adminsdk.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Set up admin
var db = admin.database();


/**
     * Returns success status: boolean
     *
*/
const saveAccessCode = async (phoneNumber, accessCode) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  ref.set({ accessCode })
}

const getAccessCode = async (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  const value = await ref.once("value");
  return value.val().accessCode
}

const clearAccessCode = (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  ref.set({ accessCode: "" })
}

const saveFacebookManagedPages = async (phoneNumber, facebookPagesData) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  ref.set({ facebookPagesData })
}

const getPageAccessToken = async (phoneNumber, pageId) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  const value = await ref.once("value");
  return value.val().facebookPagesData[pageId].access_token
}


module.exports = { saveAccessCode, getAccessCode, clearAccessCode, saveFacebookManagedPages, getPageAccessToken }
