const generateNewAccesCode = () => {
  const max = 999999
  const min = 100000
  const accessCode = Math.floor(Math.random() * (max - min) + min);
  return accessCode;
}


module.exports = { generateNewAccesCode }
