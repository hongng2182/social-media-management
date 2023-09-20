import React, { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import { getFacebookLoginStatus, getTimeRangeFromOptions } from '../utils';
import { useDashboardState } from '../context';
import PostCard from './PostCard';
import CreatePostDialogue from './CreatePostDialogue';
import { FacebookPostsResponse, PostDetailsWithLike, TimeOptions } from '../types';
import { fetchPostFacebook } from '../apis'



function AllPosts() {
  // dashboard context state
  const { state: { userManagedPages } } = useDashboardState()

  // Dialogue state and handler
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<PostDetailsWithLike[]>([]);

  const handleClose = () => {
    setOpen(false);
  };

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [pageId, setPageId] = useState('');
  const [timeOption, setTimeOption] = useState<string>(TimeOptions.allTime);
  const ref = useRef<PostDetailsWithLike[]>([])


  // handle show dialogue when click Create Post button
  const handleShowDialogue = () => {
    // check userlogin Status
    getFacebookLoginStatus().then((response) => {
      // If user has login
      if (response.status === "connected") {
        // showDialogue
        setOpen(true)
      } else {
        toast.error('Please connect to Facebook app to create post!')
      }
    })
  }

  // Query to get all posts
  const { refetch: refetchGetPosts } = useQuery<any, Error, [FacebookPostsResponse, { favorite_social_post: string[] }], string[]>({
    queryKey: ['get-fb-posts'],
    queryFn: fetchPostFacebook,
    onSuccess: (data) => {
      // [{success, posts: []}, {favorite_social_post}] = data
      const [postsResponse, favoritePostsResponse] = data
      const fav_posts_set = new Set(favoritePostsResponse.favorite_social_post)
      // merge to get a list of posts with favorite field
      const fbPostsWithLike = postsResponse.posts.map((post) => ({ ...post, is_favorite: fav_posts_set.has(post.id) }))
      // set posts to state
      ref.current = fbPostsWithLike
      setPosts(fbPostsWithLike)
    },
    onError: (error: Error) => {
      console.log('error', error);
    },
    enabled: userManagedPages.length > 0, // only fetch when user has managed pages
    refetchOnWindowFocus: false,
  })

  //---------------------------SEARCH-----------------------------------
  const [favoriteOnly, setFavoriteOnly] = useState(false)

  const handleFilter = () => {
    const currentList = ref.current
    let newLists = currentList
    if (searchInput) {
      newLists = currentList.filter((post) => post?.message?.toLowerCase().includes(searchInput.toLowerCase()))
    }
    if (favoriteOnly) {
      newLists = newLists.filter((post) => post.is_favorite)
    }
    if (pageId) {
      newLists = newLists.filter((post) => post.from.id === pageId)
    }
    if (timeOption) {
      const { startTime, endTime } = getTimeRangeFromOptions(timeOption)
      newLists = newLists.filter((post) => {
        const postTime = new Date(post.created_time)
        // Check if the postTime is within the specified range
        return postTime >= startTime && postTime <= endTime;
      });
    }
    setPosts(newLists)

  }

  const resetFilter = () => {
    setSearchInput('')
    setPageId('')
    setTimeOption('')
    setPosts(ref.current)
  }


  return (
    <Box sx={{ minHeight: '100vh', width: '100%' }}>
      <Stack
        justifyContent="flex-end"
        direction={'row'}
        spacing={2}
      >
        {/* create post button*/}
        <Button variant="contained" onClick={handleShowDialogue}>Create Post Facebook</Button>
      </Stack>

      {/* --------------FILTER SECTION----------------- */}
      {/* --by message-- */}
      <TextField sx={{ my: 1 }}
        label="Search by post message"
        id="Search"
        value={searchInput}
        onChange={(e) => { setSearchInput(e.target.value) }}
      />

      {/* -- by pages-- */}
      <FormControl sx={{ m: 1, minWidth: 200 }}>
        <InputLabel id="demo-simple-select-label">Choose Pages</InputLabel>
        <Select
          value={pageId}
          onChange={(e) => { setPageId(e.target.value) }}
          label="Choose Pages"
          inputProps={{ 'aria-label': 'Without label' }}
        >
          {userManagedPages.map((page) => <MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>)}
        </Select>
      </FormControl>

      {/* --by date-- */}
      <FormControl sx={{ m: 1, minWidth: 200 }}>
        <InputLabel id="demo-simple-select-label">Choose Time</InputLabel>
        <Select
          value={timeOption}
          onChange={(e) => { setTimeOption(e.target.value) }}
          label="Choose Time"
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value={TimeOptions.today}>Today</MenuItem>
          <MenuItem value={TimeOptions.thisWeek}>This week</MenuItem>
          <MenuItem value={TimeOptions.thisMonth}>This month</MenuItem>
          <MenuItem value={TimeOptions.thisYear}>This year</MenuItem>
        </Select>
      </FormControl>

      {/* -- by favorite post-- */}
      <FormGroup sx={{ m: 1, maxWidth: 300 }}>
        <FormControlLabel control={<Switch onChange={(e) => {
          setFavoriteOnly(e.target.checked)
        }} />} label="Show Favorite Posts Only" />
      </FormGroup>

      {/* --buttons-- */}
      <Button variant="contained" onClick={handleFilter}>FILTER</Button>
      <Button onClick={resetFilter} sx={{ ml: 1 }}>Clear All</Button>

      {/* --------------POSTS----------------- */}
      <Grid container spacing={2} sx={{ mt: 2 }} >
        {posts.length > 0 && posts?.map(post =>
          <Grid key={post.id} item xs={12} sm={6} md={4} >
            <PostCard postData={post} refetchGetPosts={refetchGetPosts} />
          </Grid>
        )}
      </Grid>

      {/* ------------- CREATE POST DIALOGUE---------------- */}
      <CreatePostDialogue
        open={open}
        handleClose={handleClose}
        refetchGetPosts={refetchGetPosts}
      />
    </Box>
  )
}

export default AllPosts