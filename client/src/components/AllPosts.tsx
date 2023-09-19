import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { endpoint } from '../utils/constant';
import { getFacebookLoginStatus } from '../utils/facebook-login-sdk';
import { useDashboardState } from '../context';
import PostCard from './PostCard';
import { FacebookPostsResponse, PostDetailsWithLike } from '../types';


function AllPosts() {
  const { state: { userManagedPages } } = useDashboardState()
  // Dialogue state
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<PostDetailsWithLike[]>([]);


  const handleClose = () => {
    setOpen(false);
  };

  // Create Post state
  const [pageId, setPageId] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  // Schedule Post state 
  const [scheduleOption, setScheduleOption] = useState<'now' | 'schedule'>('now');
  const [schedulePublishTime, setSchedulePublishTime] = useState<string>(Date.now().toString());

  const resetAllFields = () => {
    setPageId('')
    setMessage('')
    setLink('')
  }

  // API call
  

  const handleShowDialogue = () => {
    // check userlogin Status
    getFacebookLoginStatus().then((response) => {
      console.log(response)
      // If user has login
      if (response.status === "connected") {
        // showDialogue
        setOpen(true)
      } else {
        toast.error('Please connect to Facebook app to create post!')
      }
    })
  }

  const {  isLoading: createPostLoading, mutate: createPostMutate } = useMutation({
    mutationKey: ['create-post-facebook'],
    mutationFn: async ({ pageId, phoneNumber, message, link }: { pageId: string, phoneNumber: string, message: string, link: string }) => {
      const data = await fetch(`${endpoint}/createPostFacebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, phoneNumber, message, link }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      console.log(result);
      return result;
    },
    onSuccess: (data) => {
      // Create post success
      console.log('create post success', `https://www.facebook.com/${data.page_post_id}`);
      toast.success('Create post success!')
      handleClose()
      resetAllFields()
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });



  const { isLoading: schedulePostLoading, mutate: schedulePostMutate } = useMutation({
    mutationKey: ['schedule-post-facebook'],
    mutationFn: async ({ pageId, phoneNumber, message, link, schedulePublishTime }: { pageId: string, phoneNumber: string, message: string, link: string, schedulePublishTime: string }) => {
      const data = await fetch(`${endpoint}/createScheduledPostFacebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, phoneNumber, message, link, schedulePublishTime }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      console.log(result);
      return result;
    },
    onSuccess: (data) => {
      // Schedule Post success
      console.log('schedule post success', `https://www.facebook.com/${data.page_post_id}`);

      toast.success('Schedule post success!')
      handleClose()
      resetAllFields()
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  const handleCreateScheduleFacebookPost = () => {
    const phoneNumber = localStorage.getItem('social-phone-number')
    if (!phoneNumber) return
    // Check valid input
    if (!pageId || !message || (scheduleOption === "schedule" && !schedulePublishTime)) {
      toast.error('Please fill all fields');
      return
    }
    // Call API based on user schedule option
    scheduleOption === 'now' ?
      createPostMutate({ pageId, phoneNumber, message, link })
      :
      schedulePostMutate({ pageId, phoneNumber, message, link, schedulePublishTime })
  }

  const { isLoading } = useQuery<any, Error, [FacebookPostsResponse, { favorite_social_post : string[]}], string[]>({
    queryKey: ['get-fb-posts'],
    queryFn: async () => {
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

      console.log(resolvedData);
      return resolvedData;

    },
    onSuccess: (data) => {
      // [{success, posts: []}, {favorite_social_post}] = data
      const [postsResponse, favoritePostsResponse] = data
      const fav_posts_set = new Set(favoritePostsResponse.favorite_social_post)
      // merge to get a list of posts with favorite field
      const fbPostsWithLike = postsResponse.posts.map((post) => ({ ...post, is_favorite: fav_posts_set.has(post.id) }))
      // set posts to state
      setPosts(fbPostsWithLike)
    },
    onError: (error: Error) => {
      console.log('error', error);
    },
    enabled: userManagedPages.length > 0,
    refetchOnWindowFocus: false,
  })

  return (
    <div>
      <Stack
        justifyContent="space-between"
        direction={'row'}
        spacing={2}
      >
        Search
        <Button variant="contained" onClick={handleShowDialogue}>Create Post Facebook</Button>
      </Stack>
      {/* POSTS */}
      {isLoading && 'Loading'}
      <Stack
        useFlexGap flexWrap="wrap"
        justifyContent="space-around"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
      >
        {posts.length > 0 && posts?.map(post =>
          <PostCard key={post.id} postData={post} />
        )}
      </Stack>

      {/* DIALOGUE */}
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create/ Schedule Facebook Post</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: "20px" }}>
              Enter fields below to create/ schedule your facebook post.
            </DialogContentText>
            {userManagedPages.length > 0 &&
              <FormControl sx={{ my: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-label">Choose Pages</InputLabel>
                <Select
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  label="Choose Pages"
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {userManagedPages.map((page) => <MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>)}
                </Select>
              </FormControl>}
            <TextField
              sx={{ my: 1 }}
              multiline
              required
              id="post_details"
              label="Post Details"
              rows={4}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <br />
            <TextField fullWidth sx={{ my: 1 }}
              label="Link"
              id="post_link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <FormControl sx={{ my: 1, minWidth: 200 }}>
              <InputLabel id="demo-simple-select-label">Scheduling Options</InputLabel>
              <Select
                value={scheduleOption}
                onChange={(e) => setScheduleOption(e.target.value as 'now' | 'schedule')}
                label="Scheduling Options"
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value="now">Publish Now</MenuItem>
                <MenuItem value="schedule">Schedule</MenuItem>
              </Select>
            </FormControl>
            {scheduleOption === "schedule" && <>
              <Typography variant="caption" display="block" gutterBottom>
                Choose a time to pushlish your post, must be 10mins - 30days from now
              </Typography>
              <input
                type="datetime-local"
                id="meeting-time"
                name="meeting-time"
                value={schedulePublishTime}
                onChange={(e) => {
                  console.log(e.target.value)
                  setSchedulePublishTime(e.target.value)
                }}
              />
            </>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained"
              disabled={createPostLoading || schedulePostLoading}
              onClick={handleCreateScheduleFacebookPost}>{scheduleOption === "now" ? "Publish" : "Schedule"}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

export default AllPosts