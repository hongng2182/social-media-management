import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Button from '@mui/material/Button';
import toast from 'react-hot-toast';
import { endpoint } from '../utils/constant';

function Home() {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showVerify, setshowVerify] = useState(true);

  const { data: createAccessCode, mutate } = useMutation({
    mutationKey: ['create-access-code'],
    mutationFn: async (phoneNumber: string) => {
      const data = await fetch(`${endpoint}/CreateNewAccessCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const result = await data.json();

      if (!data.ok) throw new Error(result.message);

      console.log(result);
      return result;
    },
    onSuccess: () => {
      console.log('success');
      setshowVerify(false);
    },
    onError: (error: Error) => {
      console.log('error', error);
      toast.error(error.message);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: validateCode, mutate: mutateValidateCode } = useMutation({
    mutationKey: ['validate-access-code'],
    mutationFn: async ({
      phoneNumber,
      accessCode,
    }: {
      phoneNumber: string,
      accessCode: string
    }) => {
      const data = await fetch(`${endpoint}/ValidateAccessCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, accessCode }),
      });
      const result = await data.json();
      if (!data.ok) throw new Error(result.message);
      console.log(result);
      return result;
    },
    onSuccess: () => {
      toast.success('Welcome to Social App');
      localStorage.setItem('social-phone-number', phoneNumber);
      return navigate("/dashboard");
    },
    onError: (error: Error) => {
      console.log(error);
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
    <div>
      {showVerify && (
        <form onSubmit={handleSendVerificationCode}>
          <PhoneInput
            country={'vn'}
            onlyCountries={['us', 'vn']}
            value={phoneNumber}
            onChange={(phone) => setPhoneNumber(phone)}
          />
          <Button type="submit" variant="contained">
            Send Verification Code
          </Button>
        </form>
      )}
      <br />
      {createAccessCode?.success && (
        <>
          <form onSubmit={handleValidateAccessCode}>
            <p>
              Social App has sent an OTP code to: {''}
              {createAccessCode?.message}
            </p>
            <label htmlFor="access-code">Please enter your code here:</label>
            <input
              type="text"
              name="access-code"
              onChange={(e) => setAccessCode(e.target.value)}
            />
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

export default Home;
