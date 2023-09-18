const { saveFacebookManagedPages, getPageAccessToken } = require('../config/firebase')
const { transformArrayToObject } = require('../utils')

const express = require("express");

const router = express.Router();

router.post('/loginFacebook', async (req, res) => {
  // Destructure params
  const { userID, accessToken } = req.body

  // Get Facebook APPID and SECRET for app access token
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  // Call API to FB endpoint to confirm identity | verify user token
  const endpoint = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`

  const data = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const result = await data.json();

  // If api call success => check valid
  if (data.ok && result.data) {
    const { user_id, is_valid } = result.data
    if (user_id == userID && is_valid) {
      // return success for valid user
      res.status(200).json({
        success: true,
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Login failed"
      })
    }
  }
})

router.post('/getUserPages', async (req, res) => {
  // Destructuring params
  const { userID, accessToken, phoneNumber } = req.body

  // Call FB API to get all pages that user manage and its token
  const endpoint = `https://graph.facebook.com/${userID}/accounts?fields=name,access_token&access_token=${accessToken}`

  const data = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const result = await data.json();
  // If api call success  
  if (data.ok && result.data) {
    // save all pages in DB
    const pages_data = result.data

    // return error when no pages found
    if (pages_data.length === 0) {
      return res.status(200).json({ message: 'No pages found' })
    }

    // transform pages array to object to dave in db with format  {id: {name, access_token}} for easier retrieve later
    const pages_data_object = transformArrayToObject(pages_data)

    // save transform data to db
    saveFacebookManagedPages(phoneNumber, pages_data_object)

    // if saveSuccess => return pages user manage in [{name: string, id: string}] to client
    const pages_data_without_token = pages_data.map(page =>
      ({ id: page.id, name: page.name }))

    res.status(200).json({
      success: true,
      pages: pages_data_without_token
    })
  }
})

router.post('/createPostFacebook', async (req, res) => {
  // Destructure params
  const { pageId, phoneNumber, message, link } = req.body

  // Retrieve db to get pageAccesstoken
  const pageAccessToken = await getPageAccessToken(phoneNumber, pageId)

  // Call FB API to create post
  const params = {
    message: message ? `&message=${message}` : '',
    link: link ? `&link=${link}` : '',
  }

  const endpoint = `https://graph.facebook.com/${pageId}/feed?${params.message}${params.link}&access_token=${pageAccessToken}`

  const data = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await data.json();

  // If api call success [success will return id of post just create {"id": "{page-post-id}"}]
  if (data.ok && result.id) {
    // return success
    res.status(200).json({
      success: true,
      page_post_id: result.id
    })
  } else {
    res.status(500).json({
      success: false,
      message: "Error creating post. Please try again."
    })
  }
})

router.post('/createScheduledPostFacebook', async (req, res) => {
  // Desctructure params
  const { pageId, phoneNumber, message, link, schedulePublishTime } = req.body

  // Retrieve db to get pageAccesstoken
  const pageAccessToken = await getPageAccessToken(phoneNumber, pageId)

  // Call API to shedule post
  const params = {
    message: message ? `&message=${message}` : '',
    link: link ? `&link=${link}` : '',
  }
  const endpoint = `https://graph.facebook.com/${pageId}/feed?published=false${params.message}${params.link}&scheduled_publish_time=${schedulePublishTime}&access_token=${pageAccessToken}`

  const data = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await data.json();

  // If api call success [success will return id of post just create {"id": {page-post-id}"}]
  if (data.ok && result.id) {
    // return success
    res.status(200).json({
      success: true,
      page_post_id: result.id
    })
  } else {
    res.status(500).json({
      success: false,
      message: "Error creating scheduled post. Please try again."
    })
  }

})

module.exports = router;