const express = require("express");
// var methodOverride = require('method-override')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// app.use(methodOverride('X-HTTP-Method-Override'))

app.set("view engine", "ejs");
// app.set("views", "./views");

function generateRandomString() {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let output = ''
  for(let i = 0; i < 6; i++) {
    output += string[Math.floor(Math.random() * string.length)]
  }
  return output
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  console.log(req.body);  
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(urlDatabase)
  res.redirect("/urls/" +shortURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log("here")
  console.log(req)
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req)
   delete urlDatabase[req.params.shortURL]
   res.redirect("/urls")
})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});