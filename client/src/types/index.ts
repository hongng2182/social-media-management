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

export interface FacebookPostsResponse {
  success: boolean
  posts: PostDetails[]
}

export interface PostDetails {
  is_published: boolean
  id: string
  attachments?: PostAttachments
  created_time: string
  from: PostCreator
  message?: string
}

export interface PostDetailsWithLike extends PostDetails {
  is_favorite: boolean;
}

export interface PostAttachments {
  data: PostAttachmentsDetails[]
}

export interface PostAttachmentsDetails {
  url: string
  media_type: string // photo, link
  unshimmed_url: string,
  media?: Media
}

export interface Media {
  image: Image
}

export interface Image {
  height: number
  src: string
  width: number
}

interface PostCreator {
  name: string
  id: string
}