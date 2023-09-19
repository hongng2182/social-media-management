import React from 'react'
import Button from '@mui/material/Button';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { endpoint } from '../utils/constant';
import { fbLogin } from '../utils/facebook-login-sdk';
import { useDashboardState } from '../context';
import { setUserManagedPages } from '../action';

function Accounts() {
  const { dispatch } = useDashboardState()
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
      console.log('pages', data);
      dispatch(setUserManagedPages(data.pages))
      // setPages(data.pages)
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  const { data: loginData, mutate: logInMutate } = useMutation({
    mutationKey: ['login-facebook'],
    mutationFn: async ({ userID, accessToken }: { userID: string, accessToken: string }) => {
      const data = await fetch(`${endpoint}/loginFacebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, accessToken }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      return result;
    },
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
    <div>Facebook:
      <Button variant="contained" onClick={handleSignInWithFacebook}>{loginData?.success ? 'Connected' : 'Add'}</Button>
    </div>
  )
}

export default Accounts