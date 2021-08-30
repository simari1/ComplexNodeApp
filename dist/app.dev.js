"use strict";

var express = require("express");

var app = express();

var session = require("express-session");

var router = require("./Utils/router");

var apiRouter = require("./Utils/router-api"); //https://daikiojm.hatenablog.com/entry/2017/05/28/201621


var MongoStore = require("connect-mongo")(session);

var flash = require("connect-flash");

var markdown = require("marked");

var sanitizeHtml = require("sanitize-html");

var csrf = require("csurf");

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
app.use("/api", apiRouter); //https://qiita.com/MahoTakara/items/05d1c9fd1a1ee14dc01c#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E7%AE%A1%E7%90%86%E3%81%AE%E3%83%9F%E3%83%89%E3%83%AB%E3%82%A6%E3%82%A7%E3%82%A2%E3%81%AE%E4%BD%9C%E6%88%90
//https://stackoverflow.com/questions/59638751/the-expireafterseconds-option-is-supported-on-ts-field-only-error-is-s
//https://www.npmjs.com/package/express-session

var sessionOptions = session({
  secret: "Testsecret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    client: require("./Utils/db"),
    dbName: "ComplexApp",
    ttl: 24 * 60 * 60 * 1000,
    autoRemove: "interval",
    autoRemoveInterval: 10
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
});
app.use(sessionOptions);
app.use(express["static"]("public"));
app.use(flash());
app.set("views", "views");
app.set("view engine", "ejs"); // //middleware function
// //https://qiita.com/kamihork/items/9707461bcb2ec8346c9b

app.use(function (req, res, next) {
  // make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function (content) {
    return markdown(content);
  }; // make all error and success flash messages available from all templates


  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success"); // make current user id available on the req object

  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  } // make user session data available from within view templates


  res.locals.user = req.session.user;
  next();
});
app.use(csrf());
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use("/", router);
app.use(function (err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site forgery detected");
      req.session.save(function () {
        return res.redirect("/");
      });
    } else {
      res.render("/404");
    }
  }
}); //https://socket.io/get-started/chat

var http = require("http");

var server = http.createServer(app);

var _require = require("socket.io"),
    Server = _require.Server; //お勉強用
// const { e } = { c: 1,
//                    d: 2,
//                    e: { f: 3, g: 5 }
//                  };


var io = new Server(server);
io.use(function (socket, next) {
  sessionOptions(socket.request, socket.request.res, next);
});
io.on("connection", function (socket) {
  if (socket.request.session.user) {
    var user = socket.request.session.user;
    socket.emit("welcome", {
      username: user.username,
      avatar: user.avatar
    });
    socket.on("chatMessageFromBrowser", function (data) {
      socket.broadcast.emit("chatMessageFromServer", {
        message: sanitizeHtml(data.message, {
          allowedTags: [],
          allowedAttributes: []
        }),
        username: user.username,
        avatar: user.avatar
      });
    });
  }
});
module.exports = server;