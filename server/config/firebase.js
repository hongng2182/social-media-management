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
  const ref = db.ref(`phoneNumber/${phoneNumber}/accessCode`);
  ref.set(accessCode)
}

const getAccessCode = async (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  const value = await ref.once("value");
  return value.val().accessCode
}

const clearAccessCode = (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}/accessCode`);
  ref.set("")
}

const saveFacebookManagedPages = async (phoneNumber, facebookPagesData) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}/facebookPagesData`);
  ref.set(facebookPagesData)
}

const getPageAccessToken = async (phoneNumber, pageId) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}`);
  const value = await ref.once("value");
  return value.val().facebookPagesData[pageId].access_token
}

const saveFavoritePosts = async (phoneNumber, social_post_id) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}/favorite_social_post`);
  const value = await ref.once("value");
  const currentPosts = value.val()  // [] or null
  if (!currentPosts) {
    ref.set([social_post_id])
  } else {
    // Don't save if post_id has existed
    if (currentPosts.includes(social_post_id)) {
      return
    } else {
      ref.set([...currentPosts, social_post_id])
    }
  }
}

const getFavoritePosts = async (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}/favorite_social_post`);
  const value = await ref.once("value");
  return value.val()
}

const getListPagesAccessToken = async (phoneNumber) => {
  const ref = db.ref(`phoneNumber/${phoneNumber}/facebookPagesData`);
  const value = await ref.once("value");
  return value.val()
}

module.exports = { saveAccessCode, getAccessCode, clearAccessCode, saveFacebookManagedPages, getPageAccessToken, saveFavoritePosts, getFavoritePosts, getListPagesAccessToken }
