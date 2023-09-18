import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query';
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
import { endpoint } from '../utils/constant';
import { getFacebookLoginStatus } from '../utils/facebook-login-sdk';


function AllPosts() {
  // Dialogue state
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  // Create Post state
  const [pageId, setPageId] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [pages, setPages] = useState<{ id: string, name: string }[]>([]);

  // Schedule Post state 
  const [scheduleOption, setScheduleOption] = useState<'now' | 'schedule'>('now');
  const [schedulePublishTime, setSchedulePublishTime] = useState<string>(Date.now().toString());

  const resetAllFields = () => {
    setPageId('')
    setMessage('')
    setLink('')
  }

  // API call
  const { mutate: userPagesMutate } = useMutation({
    mutationKey: ['get-user-pages'],
    mutationFn: async ({ userID, accessToken, phoneNumber }: { userID: string, accessToken: string, phoneNumber: string }) => {
      const data = await fetch(`${endpoint}/getUserPages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, accessToken, phoneNumber }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      console.log(result);
      return result;
    },
    onSuccess: (data) => {
      // Save user pages to pages state
      setPages(data.pages)
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  const handleShowDialogue = () => {
    // check userlogin Status
    getFacebookLoginStatus().then((response) => {
      console.log(response)
      // If user has login
      if (response.status === "connected") {
        // get phoneNumber in localStorage
        const phoneNumber = localStorage.getItem('social-phone-number')
        if (!phoneNumber) return
        const { userID, accessToken } = response.authResponse;
        // call api to /getUserPages to get user's FB managed pages to render in dialogue
        userPagesMutate({ userID, accessToken, phoneNumber })
        // showDialogue
        setOpen(true)
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


  return (
    <div>
      <Button variant="contained" onClick={handleShowDialogue}>Create Post Facebook</Button>
      <div>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create/ Schedule Facebook Post</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ marginBottom: "20px" }}>
              Enter fields below to create/ schedule your facebook post.
            </DialogContentText>
            {pages.length > 0 &&
              <FormControl sx={{ my: 1, minWidth: 200 }}>
                <InputLabel id="demo-simple-select-label">Choose Pages</InputLabel>
                <Select
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  label="Choose Pages"
                  inputProps={{ 'aria-label': 'Without label' }}
                >
                  {pages.map((page) => <MenuItem key={page.id} value={page.id}>{page.name}</MenuItem>)}
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