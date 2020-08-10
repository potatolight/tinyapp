//compare email with in the database//
const getUserByEmail = function(email, database) {
  let user = "";
  for (let key in database) {
    if (database[key]["email"] === email) {
      user = key;
      return user;
    }
  }
  return undefined;
};

//get value of the object which key is eqaul to id
const urlsForUser = function(id, urlDatabase) {
  let output = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      output[key] = urlDatabase[key];
    }
  }
  return output;
};
//generate random string//
const generateRandomString = function() {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += string[Math.floor(Math.random() * string.length)];
  }
  return output;
};

module.exports = { getUserByEmail, urlsForUser,  generateRandomString};