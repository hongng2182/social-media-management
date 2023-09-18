import { FbAuthresponse } from '../types';

declare global {
  interface Window {
    FB: any;
  }
}

export const fbLogin = () => new Promise<FbAuthresponse>((resolve, reject) => {
  window.FB.login((response: FbAuthresponse) => {
    if (response.status === 'connected') {
      // Logged into your webpage and Facebook.
      resolve(response)
    } else {
      // The person is not logged into your webpage or we are unable to tell. 
      reject(response)
    }
  },
    { scope: 'pages_manage_posts,pages_show_list,public_profile,pages_read_engagement,business_management' })
})

export const getFacebookLoginStatus = () => new Promise<FbAuthresponse>((resolve, reject) => {
  window.FB.getLoginStatus((response: FbAuthresponse) => {
    if (response.status === 'connected') {
      // Logged into your webpage and Facebook.
      resolve(response)
    } else {
      // The person is not logged into your webpage or we are unable to tell. 
      reject(response)
    }
  });
});
