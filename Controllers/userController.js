"use strict";

const User = require("../Models/User");
const Post = require("../Models/Post");

exports.login = function (req, res) {
  let user = new User(req.body);

  user
    .login()
    .then(function (result) {
      req.session.user = {
        username: req.body.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(function (err) {
      req.flash("loginErrors", err);
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch((registrationErrors) => {
      registrationErrors.forEach(function (err) {
        req.flash("registrationErrors", err);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("../Views/home-dashboard.ejs");
  } else {
    //https://github.com/jaredhanson/connect-flash
    //https://stackoverflow.com/questions/64594683/avoid-req-flash-delete-data-on-middleware
    //req.flashで参照すると消えるので注意
    res.render("../Views/home-guest.ejs", {
      loginErrors: req.flash("loginErrors"),
      registrationErrors: req.flash("registrationErrors"),
      errors: req.flash("errors"),
    });
  }
};

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "need to be logged in");
    req.session.save(function () {
      res.redirect("/");
    });
  }
};

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      req.profileUser = userDocument;
      next();
    })
    .catch(function () {
      res.render("../Views/404.ejs");
    });
};

exports.profilePostsScreen = function (req, res) {
  Post.findPostsByAuthorId(req.profileUser._id)
    .then(function (posts) {

      console.log("3", posts);

      res.render("../Views/profile.ejs", {
        profileUserName: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        posts: posts,
      });
    })
    .catch(function () {
      res.render("../Views/404.ejs");
    });
};
