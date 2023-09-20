import React from 'react'
import Button from '@mui/material/Button';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { fbLogin } from '../utils/facebook-login-sdk';
import { useDashboardState } from '../context';
import { setUserManagedPages } from '../action';
import { fetchUserPages, fetchLoginFacebook } from '../apis';

function Accounts() {
  const { dispatch } = useDashboardState()

  const { mutate: userPagesMutate } = useMutation({
    mutationKey: ['get-user-pages'],
    mutationFn: fetchUserPages,
    onSuccess: (data) => {
      // Save user pages to pages state
      dispatch(setUserManagedPages(data.pages))
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  const { data: loginData, mutate: logInMutate } = useMutation({
    mutationKey: ['login-facebook'],
    mutationFn: fetchLoginFacebook,
    onSuccess: (_, { userID, accessToken }) => {
      // call get user pages and save in global state
      const phoneNumber = localStorage.getItem('social-phone-number')
      if (!phoneNumber) return
      userPagesMutate({ userID, accessToken, phoneNumber })
      toast.success('Successfully Connected to Facebook!');
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  const handleSignInWithFacebook = async () => {
    fbLogin().then((response) => {
      if (response.status === "connected") {
        const { userID, accessToken } = response.authResponse;
        // call api /loginFacebook to confirm identity
        logInMutate({ userID, accessToken })
      }
    })
  }

  return (
    <Box sx={{ height: '100vh' }}>
      <Card sx={{ width: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Facebook
          </Typography>
          <Typography sx={{ fontSize: 14, mt: 1 }} color="text.secondary" gutterBottom>
            Manage Facebook Pages.
          </Typography>
        </CardContent>
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSignInWithFacebook}>{loginData?.success ? 'Connected' : 'Add'}</Button>
        </CardActions>
      </Card>
    </Box>
  )
}

export default Accounts