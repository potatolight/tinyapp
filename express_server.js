const express = require("express");
// var methodOverride = require('method-override')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())
// app.use(methodOverride('X-HTTP-Method-Override'))

app.set("view engine", "ejs");
// app.set("views", "./views");
//----helper function ----------------//
function generateRandomString() {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for(let i = 0; i < 6; i++) {
    output += string[Math.floor(Math.random() * string.length)];
  }
  return output;
}

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
}

//--------helper function----------//

function urlsForUser (id) {
  let output = {}
  for(let key in urlDatabase) {
    if(urlDatabase[key]["userID"]=== id) {
      output[key] = urlDatabase[key];
    }
  }
  return output
}


//---------delete -------------------//
app.post("/urls/:shortURL/delete", (req, res) => {
   delete urlDatabase[req.params.shortURL]
   res.redirect("/urls")
});




//-----------login------------------//
app.get("/login", (req, res) => {
  res.render("urls_login")
})

app.post("/login", (req,res) => {
  let user = req.body;
  if(!user.email && !user.password ) {
     return res.send('Please write valid email address')
  }
  for(let key in users) {
     if( users[key]['email'] === user['email'] && users[key]['password'] === user['password']) {
      res.cookie("user_id", key)
     return res.redirect("/urls/" + key);
    } 
  }  
  return res.send('The user is not in the database')
})


//------------ urls ------------------//



app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']]}
  if(templateVars['user'] === undefined) {
    res.redirect('/login')
  } 
   res.render("urls_new", templateVars);
});


app.post("/urls/:shortURL", (req, res) => {
  for(let key in urlDatabase) {
    if(!req.body['longURL'] || urlDatabase[key]['longURL'] === req.body['longURL'] ) {
      return  res.send('The longURL is invalid! Please kindly reupdate the longURL') 
    }
  }
  const data = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
   urlDatabase[req.params.shortURL] = data;
   res.redirect("/urls")
})

app.get("/urls/:id", (req,res) => {
  const userID = req.params.id;
  const result = urlsForUser(userID);
  const templateVars  = {user: users[userID], urls: result};
  res.render("urls_index", templateVars)
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  for(let key in urlDatabase) {
    if(!req.body['longURL'] || urlDatabase[key]['longURL'] === req.body['longURL'] ) {
      return res.redirect("/urls");
    } 
  }
  const data = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  urlDatabase[shortURL] = data;

  return res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  let user;
  if(req.cookies["user_id"]) {
    if(users[req.cookies["user_id"]]) {
      user = users[req.cookies["user_id"]];
    }
  }
  const who = urlsForUser (req.cookies['user_id'])
  let templateVars = { 
    urls: who,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user: users[req.cookies['user_id']]}
  res.render("urls_show", templateVars);
});


// -------- logout -----------------//
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
})





//----------rigister--------------//

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req,res) => {
  let user_id = generateRandomString();
  let user = req.body;
  if(!user.email && !user.password ) {
    return res.send('Please write valid email address')
  }
 for(let key in users) {
    if( users[key].email === user.email) {
    return res.send('The user is in the database')
      } 
   }
  users[user_id] = {
  id: user_id,
  email: user.email,
  password: user.password
  }
  res.cookie('user_id', user_id);
  return res.redirect('/urls' + user_id)
});

//-------- u/:shortURL--------------------//
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

