import React, { useState } from 'react'
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { FavoriteIcon } from './icons';
import { PostDetailsWithLike } from '../types';
import { useMutation } from '@tanstack/react-query';
import { fetchLikeSocialPosts } from '../apis';
import toast from 'react-hot-toast';

type PostCardProps = { postData: PostDetailsWithLike, refetchGetPosts: () => {} }

function PostCard({ postData, refetchGetPosts }: PostCardProps) {
  // Destructuring postData
  const { message, id: social_post_id, attachments, created_time, from: { name: pageName, picture: { data: { url: avatarUrl } } }, is_favorite } = postData

  // Convert created_time to date string
  const dateTime = new Date(created_time)
  const dateTimeString = dateTime.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  // Get all photos and links from attachments
  const postPhotos = attachments?.data?.filter((attachment => attachment.media_type === "photo"))
  const postLinks = attachments?.data?.filter((attachment => attachment.media_type === "link"))

  // Create like post state
  const [like, setLike] = useState(is_favorite)

  // like post mutation
  const { mutate: mutateLikePost } = useMutation({
    mutationKey: ['like-social-post'],
    mutationFn: fetchLikeSocialPosts,
    onSuccess: () => {
      setLike(true)
      toast.success('Successfully like post!')
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  })


  const handleLikeSocialPost = () => {
    const phone_number = localStorage.getItem('social-phone-number')
    if (!phone_number) return
    // Make call to /likeSocialPost : POST (phone_number, social_post_id)
    mutateLikePost({ phone_number, social_post_id })
    // Refetch getFacebookPosts query
    refetchGetPosts()
  }

  return (
    <Card sx={{ bgcolor: '#F3F6F9' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: `#9c27b0` }} aria-label="avatar" src={avatarUrl} alt="avatar" />
        }
        title={pageName}
        subheader={dateTimeString}
      />
      {postPhotos && postPhotos.length > 0 && postPhotos?.map((photo, index) => <CardMedia
        sx={{ maxHeight: 200 }}
        key={index}
        component="img"
        height={photo?.media?.image.height}
        image={photo?.media?.image.src}
        alt="post-image"
      />)}
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {postLinks && postLinks.length > 0 && postLinks.map((link, index) => <Link key={index} href={link.unshimmed_url}> {link.unshimmed_url}
        </Link>)}
      </CardContent>
      <CardActions disableSpacing onClick={handleLikeSocialPost}>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon type={like ? "fill" : "outline"} />
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default PostCard