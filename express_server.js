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

function generateRandomString() {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let output = '';
  for(let i = 0; i < 6; i++) {
    output += string[Math.floor(Math.random() * string.length)]
  }
  return output;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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


app.post("/urls/:shortURL/delete", (req, res) => {

   delete urlDatabase[req.params.shortURL]
   res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {

  let values = Object.values(urlDatabase)
  if(req.body['longURL'] !== undefined && !values.includes(req.body['longURL'])) {
    urlDatabase[req.params.shortURL] = req.body['longURL'] 
  } else {
    res.send('The longURL is invalid! Please kindly reupdate the longURL') 
  }
   res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
 
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: users[req.cookies['user_id']].email}
    // req.cookies["username"]};
  res.render("urls_show", templateVars);
});

// app.post("/login", (req, res) =>{
//   const user = req.body;
//   const email = users[req.cookies[user_id]].email
//   const password = users[req.cookies[user_id]].password
//   if(user['email'] !== email && user['password'] !== password) {
//     res.redirect("/urls/${req.cookies[user_id]}")
//   } else {
//     res.redirect('/register');
//   }
// });

app.get("/login", (req, res) => {
  res.render("urls_login")
})

app.post("/login", (req,res) => {
  let user_id = generateRandomString();
  let user = req.body;
  if(!user.email && !user.password ) {
    res.send('Please write valid email address')
  }
  for(let key in users) {
    console.log("key: ", users[key])
     if( users[key].email === user.email && users[key].password === user.password) {
      res.redirect("/urls");
       } 
  }  
   res.send('The user is in the database')

})



app.get("/urls", (req, res) => {
  let email;
  if(req.cookies["user_id"]) {
    if(users[req.cookies["user_id"]]) {
      email = users[req.cookies["user_id"]].email
    }
  }
  let templateVars = { 
    urls: urlDatabase,
    email
  };
 console.log(templateVars['email'])
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString() 
  urlDatabase[shortURL] = req.body['longURL'];
  res.redirect("/urls/" +shortURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req,res) => {
  let user_id = generateRandomString();
  let user = req.body;
  if(!user.email && !user.password ) {
    res.send('Please write valid email address')
  }
 for(let key in users) {
   console.log("key: ", users[key])
    if( users[key].email === user.email) {
      res.send('The user is in the database')
      } 
   }
          users[user_id] = {
          id: user_id,
          email: user.email,
          password: user.password
        }
        res.cookie('user_id', user_id);
        console.log(users)
        res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// res.cookie('user_id', req.body.user_id );