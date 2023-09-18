export type FbAuthresponse = {
  authResponse: {
    accessToken: string,
    data_access_expiration_time: number,
    expiresIn: number,
    graphDomain: "facebook",
    signedRequest: string,
    userID: string
  },
  status: "connected"
}