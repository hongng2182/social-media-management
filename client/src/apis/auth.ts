import { endpoint } from "../utils";

const fetchLoginFacebook = async ({ userID, accessToken }: { userID: string, accessToken: string }) => {
  const response = await fetch(`${endpoint}/loginFacebook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userID, accessToken }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchCreateNewAccessCode = async (phoneNumber: string) => {
  const response = await fetch(`${endpoint}/CreateNewAccessCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber }),
  });

  const result = await response.json();

  if (!response.ok) throw new Error(result.message);

  return result;
}

const fetchValidateAccessCode = async ({ phoneNumber, accessCode }: {
  phoneNumber: string,
  accessCode: string
}) => {
  const response = await fetch(`${endpoint}/ValidateAccessCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumber, accessCode }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  
  return result;
}

export { fetchCreateNewAccessCode, fetchLoginFacebook, fetchValidateAccessCode }
