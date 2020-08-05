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
 
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/login", (req,res) => {
  res.cookie('username', req.body.username);
  // console.log('Cookies: ', req.cookies);
  res.redirect("/urls");
})


app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  // console.log(templateVars.username)
  res.render("urls_index", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});