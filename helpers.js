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

module.exports = { getUserByEmail };