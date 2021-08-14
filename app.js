const express = require("express");
const app = express();
const session = require("express-session");
const router = require("./Utils/router");
//https://daikiojm.hatenablog.com/entry/2017/05/28/201621
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");

//https://qiita.com/MahoTakara/items/05d1c9fd1a1ee14dc01c#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E7%AE%A1%E7%90%86%E3%81%AE%E3%83%9F%E3%83%89%E3%83%AB%E3%82%A6%E3%82%A7%E3%82%A2%E3%81%AE%E4%BD%9C%E6%88%90
//https://stackoverflow.com/questions/59638751/the-expireafterseconds-option-is-supported-on-ts-field-only-error-is-s
//https://www.npmjs.com/package/express-session
let sessionOptions = session({
  secret: "Testsecret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    client: require("./Utils/db"),
    dbName: "ComplexApp",
    ttl: 24 * 60 * 60 * 1000,
    autoRemove: "interval",
    autoRemoveInterval: 10,
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
});

app.use(sessionOptions);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(flash());

app.set("views", "views");
app.set("view engine", "ejs");

//middleware function
//https://qiita.com/kamihork/items/9707461bcb2ec8346c9b
app.use(function (req, res, next) {
  //makle markdown available in ejs
  res.locals.filterUserHTML = function (content) {
    return markdown(content);
  };

  //make all flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  //make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  // make user session data available from wityhin view templates
  res.locals.user = req.session.user;
  next();
});

app.use("/", router);

module.exports = app;
