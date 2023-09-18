const generateNewAccesCode = () => {
  const max = 999999
  const min = 100000
  const accessCode = Math.floor(Math.random() * (max - min) + min);
  return accessCode;
}

// Tranform pages array data to object with keys = pageId
function transformArrayToObject(array) {
  const result = {};
  for (const obj of array) {
    const { id, name, access_token } = obj
    result[id] = { name, access_token };
  }
  return result;
}


module.exports = { generateNewAccesCode, transformArrayToObject }
