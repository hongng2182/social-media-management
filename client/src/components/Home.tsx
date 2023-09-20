import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { fetchValidateAccessCode, fetchCreateNewAccessCode } from '../apis';

function Home() {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showVerify, setshowVerify] = useState(true);

  const { data: createAccessCode, mutate } = useMutation({
    mutationKey: ['create-access-code'],
    mutationFn: fetchCreateNewAccessCode,
    onSuccess: () => {
      setshowVerify(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const { mutate: mutateValidateCode } = useMutation({
    mutationKey: ['validate-access-code'],
    mutationFn: fetchValidateAccessCode,
    onSuccess: () => {
      toast.success('Welcome to SOCIAL SYNC');
      localStorage.setItem('social-phone-number', phoneNumber);
      return navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSendVerificationCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneNumber) return;
    mutate(phoneNumber);
  };

  const handleValidateAccessCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessCode || !phoneNumber) return;
    mutateValidateCode({ phoneNumber, accessCode });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        </Avatar>
        <Typography component="h1" variant="h5">
          Welcome to SOCIALSYNC
        </Typography>
        <Box sx={{ mt: 1, width: 350 }}>
          {showVerify && (
            <Box sx={{ width: '100%' }} >
              <Typography sx={{ display: 'block' }} textAlign="center" variant="caption">
                Enter a mobile phone number that you have access to.
                <br />This number will be used to log in to SOCIALSYNC App.
              </Typography>
              <form onSubmit={handleSendVerificationCode} style={{ marginTop: '30px' }}>
                <PhoneInput
                  inputStyle={{ width: '100%' }}
                  country={'vn'}
                  onlyCountries={['us', 'vn']}
                  value={phoneNumber}
                  onChange={(phone) => setPhoneNumber(phone)}
                />
                <Button sx={{ mt: 2 }} fullWidth type="submit" variant="contained">
                  Send Verification Code
                </Button>
              </form>
            </Box>
          )}
          {createAccessCode?.success && (
            <form onSubmit={handleValidateAccessCode}>
              <Typography variant="body2" textAlign="center">
                SOCIALSYNC App has sent an OTP code to: {''}
                <b>{createAccessCode?.message}</b>
              </Typography>
              <TextField
                fullWidth
                name="access-code"
                label="Enter your code here"
                variant="standard"
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <Button sx={{ mt: 2 }} fullWidth type="submit" variant="contained">
                Submit
              </Button>
            </form>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
