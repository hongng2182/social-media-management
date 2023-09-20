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
import Autocomplete from '@mui/material/Autocomplete';
import { useDashboardState } from '../context';
import { fetchCreatePostFacebook, fetchCreateScheduledPostFacebook } from '../apis'

type CreatePostDialogueProps = { open: boolean, handleClose: () => void, refetchGetPosts: () => void }

function CreatePostDialogue({ open, handleClose, refetchGetPosts }: CreatePostDialogueProps) {
  // Dashboard state
  const { state: { userManagedPages } } = useDashboardState()

  // Create state
  const [selectedPages, setSelectedPages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [scheduleOption, setScheduleOption] = useState<'now' | 'schedule'>('now');
  const [schedulePublishTime, setSchedulePublishTime] = useState<string>(Date.now().toString());

  // Create post mutation
  const { isLoading: createPostLoading, mutate: createPostMutate } = useMutation({
    mutationKey: ['create-post-facebook'],
    mutationFn: fetchCreatePostFacebook,
    onSuccess: (data) => {
      toast.success('Create post success!')
      handleClose()
      resetAllFields()
      refetchGetPosts()
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Schedule post mutation
  const { isLoading: schedulePostLoading, mutate: schedulePostMutate } = useMutation({
    mutationKey: ['schedule-post-facebook'],
    mutationFn: fetchCreateScheduledPostFacebook,
    onSuccess: (data) => {
      // Schedule Post success
      toast.success('Schedule post success!')
      handleClose()
      resetAllFields()
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // handleSelectedPagesChange change
  const handleSelectedPagesChange = (e: any, newValue: any[]) => {
    setSelectedPages(newValue);
  };

  const resetAllFields = () => {
    setMessage('')
    setLink('')
  }

  const handleCreateScheduleFacebookPost = () => {
    const phoneNumber = localStorage.getItem('social-phone-number')
    if (!phoneNumber) return
    // Check valid input
    if (selectedPages.length === 0 || !message || (scheduleOption === "schedule" && !schedulePublishTime)) {
      toast.error('Please fill all fields');
      return
    }
    // Call API based on user schedule option
    scheduleOption === 'now' ?
      createPostMutate({ selectedPages, phoneNumber, message, link })
      :
      schedulePostMutate({ selectedPages, phoneNumber, message, link, schedulePublishTime })
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create/ Schedule Facebook Post</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ marginBottom: "20px" }}>
            Enter fields below to create/ schedule your facebook post.
          </DialogContentText>
          {userManagedPages.length > 0 &&
            <FormControl sx={{ my: 1, minWidth: 200 }}>
              <Autocomplete
                multiple
                value={selectedPages}
                onChange={handleSelectedPagesChange}
                options={userManagedPages}
                getOptionLabel={(option) => option.name}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose Pages"
                    placeholder="Choose Pages"
                  />
                )}
              />
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
  )
}

export default CreatePostDialogue