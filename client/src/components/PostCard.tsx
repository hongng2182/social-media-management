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
import { red } from '@mui/material/colors';
import { FavoriteIcon } from './icons';
import { PostDetailsWithLike } from '../types';
import { useMutation } from '@tanstack/react-query';
import { endpoint } from '../utils/constant';
import toast from 'react-hot-toast';


function PostCard({ postData }: { postData: PostDetailsWithLike }) {
  const { message, id: social_post_id, attachments, created_time, from: { name: pageName }, is_favorite } = postData
  const dateTime = new Date(created_time)
  const dateTimeString = dateTime.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const postPhotos = attachments?.data?.filter((attachment => attachment.media_type === "photo"))
  const postLinks = attachments?.data?.filter((attachment => attachment.media_type === "link"))

  const [like, setLike] = useState(is_favorite)

  const { mutate: mutateLikePost } = useMutation({
    mutationKey: ['like-social-post'],
    mutationFn: async ({ social_post_id, phone_number }: { social_post_id: string, phone_number: string }) => {
      const data = await fetch(`${endpoint}/likeSocialPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ social_post_id, phone_number }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      console.log(result);
      return result;
    },
    onSuccess: (data) => {
      console.log('like post success');
      setLike(true)
      // onSuccess: fill icon with red color

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
  }

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="avatar">
            {pageName.charAt(0).toUpperCase()}
          </Avatar>
        }
        title={pageName}
        subheader={dateTimeString}
      />
      {postPhotos && postPhotos.length > 0 && postPhotos?.map((photo, index) => <CardMedia
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