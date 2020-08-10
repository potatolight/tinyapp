const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.set("view engine", "ejs");

const { getUserByEmail } = require('./helpers');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//------data -------------------------//
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//--------helper function----------//

const urlsForUser = function(id) {
  let output = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === id) {
      output[key] = urlDatabase[key];
    }
  }
  return output;
};

const generateRandomString = function() {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += string[Math.floor(Math.random() * string.length)];
  }
  return output;
};

//---------delete -------------------//
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  let short = req.params.shortURL;
  if (user_id && urlDatabase[short]["userID"] === user_id) {
    delete urlDatabase[short];
  }
  res.redirect("/urls");
});

//----------rigister part--------//

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req,res) => {
  let user_id = generateRandomString();
  let user = req.body;
  const password = user.password;
  if (!user.email || !user.password) {
    return res.status(401).send('Error 401, Please write valid email address and password');
  }
  for (let key in users) {
    if (users[key].email === user.email) {
      return res.status(401).send('Error 401, The user is in the database');
    }
  }
  bcrypt
    .genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password,salt);
    })
    .then((hash) => {
      users[user_id] = {
        id: user_id,
        email: user.email,
        password: hash
      };
      req.session.user_id = user_id;
      return res.redirect('/urls');
    });
});


//-----------login part---------//
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req,res) => {
  let user = req.body;
  const password = user["password"];
  let user_id = getUserByEmail(user["email"], users);
  const dbData = users[user_id];
  if (!user.email || !user.password) {
    return res.status(401).send('Error 401, Please write valid email address and password');
  }
  if (!dbData) {
    return res.status(401).send('Error 401, The user is not in the database');
  }
  bcrypt
    .compare(password, dbData["password"])
    .then((result) => {
      if (result) {
        req.session.user_id = user_id;
        res.redirect("/urls");
      } else {
        res.status(401).send("Error401, password is incorrect");
      }
    });
});


//creat a new longURL get//
app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.session.user_id]};
  if (templateVars['user'] === undefined) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

//update longURL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["user_id"]) {
    return res.status(401).send("Error 401, Please enter valid ID");
  }
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(403).send('Error403, Please input valid longURL');
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//update longURl post//
app.post("/urls/:shortURL", (req, res) => {
  const data = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  urlDatabase[req.params.shortURL] = data;
  res.redirect("/urls");
});

//new longURL post//
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  const user_id = req.session["user_id"];
  for (let key in urlDatabase) {
    if (urlDatabase[key]['userID'] === user_id) {
      if (!req.body['longURL'] || urlDatabase[key]['longURL'] === req.body['longURL']) {
        return res.redirect("/urls");
      }
    }
  }
  const data = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  urlDatabase[shortURL] = data;

  return res.redirect("/urls");
});

//get urls page //
app.get("/urls", (req, res) => {
  let user;
  if (req.session.user_id) {
    if (users[req.session.user_id ]) {
      user = users[req.session.user_id ];
    }
  }
  const who = urlsForUser(req.session.user_id);
  let templateVars = {
    urls: who,
    user
  };
  res.render("urls_index", templateVars);
});


// -------- logout -----------------//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//-------- u/:shortURL--------------------//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

