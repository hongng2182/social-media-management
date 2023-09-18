import React from 'react'
import Button from '@mui/material/Button';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { endpoint } from '../utils/constant';
import { fbLogin } from '../utils/facebook-login-sdk';

function Accounts() {
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
    onSuccess: () => {
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
    <div>Facebook :
      <Button variant="contained" onClick={handleSignInWithFacebook}>{loginData?.success ? 'Connected' : 'Add'}</Button>
    </div>
  )
}

export default Accounts