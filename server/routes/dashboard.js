const { saveFacebookManagedPages, getPageAccessToken, saveFavoritePosts, getFavoritePosts, getListPagesAccessToken } = require('../config/firebase')
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
  const { selectedPages, phoneNumber, message, link } = req.body

  // create array of promises to call FB API to create post simultaneously
  const promisesArray = selectedPages.map(async (selectedPage) => {
    const pageId = selectedPage.id

    // Retrieve db to get pageAccesstoken
    const pageAccessToken = await getPageAccessToken(phoneNumber, pageId)

    // Create different endpoint for each page
    const params = {
      message: message ? `&message=${message}` : '',
      link: link ? `&link=${link}` : '',
    }

    const endpoint = `https://graph.facebook.com/${pageId}/feed?${params.message}${params.link}&access_token=${pageAccessToken}`

    // return fetch promise
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  })

  // wait for all promises to resolve
  Promise.all(promisesArray)
    .then((data) => {
      Promise.all(data.map((res) => res.json()))
        .then((resolvedData) => {
          // FB API return array of object [{id: {page-post-id}}] if success, [{error: {message, type, code}}] if error
          const isError = resolvedData.some((data) => data.error)
          console.log(resolvedData)
          // check if any error
          if (isError) {
            res.status(500).json({
              success: false,
              message: "Error creating post!"
            })
          } else {
            // return success
            res.status(200).json({
              success: true,
              postIds: resolvedData
            })
          }
        })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({
        success: false,
        message: "Error creating post!"
      })
    })

})

router.post('/createScheduledPostFacebook', async (req, res) => {
  // Destructure params
  const { selectedPages, phoneNumber, message, link, schedulePublishTime } = req.body

  // create array of promises to call FB API to create post simultaneously
  const promisesArray = selectedPages.map(async (selectedPage) => {
    const pageId = selectedPage.id

    // Retrieve db to get pageAccesstoken
    const pageAccessToken = await getPageAccessToken(phoneNumber, pageId)

    // Create different endpoint for each page
    const params = {
      message: message ? `&message=${message}` : '',
      link: link ? `&link=${link}` : '',
    }

    const endpoint = `https://graph.facebook.com/${pageId}/feed?published=false${params.message}${params.link}&scheduled_publish_time=${schedulePublishTime}&access_token=${pageAccessToken}`

    // return fetch promise
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  })

  // wait for all promises to resolve
  Promise.all(promisesArray)
    .then((data) => {
      Promise.all(data.map((res) => res.json()))
        .then((resolvedData) => {
          // FB API return array of object [{id: {page-post-id}}] if success, [{error: {message, type, code}}] if error
          const isError = resolvedData.some((data) => data.error)
          console.log(resolvedData)
          // check if any error
          if (isError) {
            res.status(500).json({
              success: false,
              message: "Error scheduling post!"
            })
          } else {
            // return success
            res.status(200).json({
              success: true,
              postIds: resolvedData
            })
          }
        })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({
        success: false,
        message: "Error scheduling post!"
      })
    })
})

router.get('/getPostFacebook', async (req, res) => {
  // Desctructure params
  const { phoneNumber } = req.query

  // list of pages id {id: {name, access_token}, id: {name, access_token}}
  const pages = await getListPagesAccessToken(phoneNumber)

  const promisesArray = Object.keys(pages).map((key) => {
    const pageId = key
    const pageAccessToken = pages[pageId].access_token

    const endpoint = `https://graph.facebook.com/${pageId}/feed?fields=is_published,id,message,attachments{url,media_type,unshimmed_url, media},created_time,from{id,name,picture},sheduled_publish_time&access_token=${pageAccessToken}`

    return fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  })

  const data = await Promise.all(promisesArray)
  // [{data: {}}, {data: {}}]
  const resolvedData = await Promise.all(data.map((res) => res.json()));

  res.status(200).json({
    success: true,
    posts: resolvedData.map(data => data.data).flat()
  })

})

router.post('/likeSocialPost', async (req, res) => {
  // Desctructure 
  const { social_post_id, phone_number } = req.body

  // Save to db at favorite_social_post
  saveFavoritePosts(phone_number, social_post_id)

  // return success
  res.status(200).json({
    success: true,
  })

})


router.get('/getFavoriterPosts', async (req, res) => {
  // Desctructure params
  const { phoneNumber } = req.query
  // Retrieve db to get favorite_social_post
  const favorite_posts = await getFavoritePosts(phoneNumber)
  // Success return: { favorite_social_post: [social_post_id] }
  res.status(200).json({
    favorite_social_post: favorite_posts
  })

})


module.exports = router;