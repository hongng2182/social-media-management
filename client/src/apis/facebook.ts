import { endpoint } from "../utils";

const fetchUserPages = async ({ userID, accessToken, phoneNumber }: { userID: string, accessToken: string, phoneNumber: string }) => {
  const response = await fetch(`${endpoint}/getUserPages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userID, accessToken, phoneNumber }),
  })

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchLikeSocialPosts = async ({ social_post_id, phone_number }: { social_post_id: string, phone_number: string }) => {
  const response = await fetch(`${endpoint}/likeSocialPost`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ social_post_id, phone_number }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchCreatePostFacebook = async ({ selectedPages, phoneNumber, message, link }: { selectedPages: { id: string, name: string }[], phoneNumber: string, message: string, link: string }) => {
  const response = await fetch(`${endpoint}/createPostFacebook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selectedPages, phoneNumber, message, link }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchCreateScheduledPostFacebook = async ({ selectedPages, phoneNumber, message, link, schedulePublishTime }: { selectedPages: { id: string, name: string }[], phoneNumber: string, message: string, link: string, schedulePublishTime: string }) => {
  const response = await fetch(`${endpoint}/createScheduledPostFacebook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selectedPages, phoneNumber, message, link, schedulePublishTime }),
  });


  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchPostFacebook = async () => {
  const phoneNumber = localStorage.getItem('social-phone-number')
  // Create promise to get facebook posts
  const getPostFb = fetch(`${endpoint}/getPostFacebook?phoneNumber=${phoneNumber}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  // Create promise to get favorite posts ids
  const getFavoritePost = fetch(`${endpoint}/getFavoriterPosts?phoneNumber=${phoneNumber}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  // Wait for all promises to resolve
  const data = await Promise.all([getPostFb, getFavoritePost])
  const resolvedData = await Promise.all(data.map((res) => res.json()));

  return resolvedData;

}


export { fetchUserPages, fetchLikeSocialPosts, fetchCreatePostFacebook, fetchCreateScheduledPostFacebook, fetchPostFacebook }
