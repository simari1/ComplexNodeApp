"use strict";

var e = require("cors");

var Post = require("../Models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  var post = new Post(req.body, req.session.user._id);
  post.create().then(function (newId) {
    req.flash("success", "successfully created");
    req.session.save(function () {
      res.redirect("/post/".concat(newId));
    });
  })["catch"](function (err) {
    err.forEach(function (e) {
      req.flash("errors", e);
    });
    req.session.save(function () {
      res.redirect("/create-post");
    });
  });
};

exports.viewSingle = function _callee(req, res) {
  var post;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Post.findSinglePostById(req.params.id, req.visitorId));

        case 3:
          post = _context.sent;
          res.render("single-post-screen", {
            post: post,
            title: post.title
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          res.render("404");

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.viewEditScreen = function _callee2(req, res) {
  var post;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Post.findSingleById(req.params.id, req.visitorId));

        case 3:
          post = _context2.sent;

          if (post.isVisitorOwner) {
            res.render("edit-post", {
              post: post
            });
          } else {
            req.flash("errors", "You do not have permission to perform that action.");
            req.session.save(function () {
              return res.redirect("/");
            });
          }

          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          res.render("404");

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.edit = function (req, res) {
  var post = new Post(req.body, req.visitorId, req.params.id);
  post.update().then(function (status) {
    if (status = "success") {
      req.flash("success", "updated successfully");
      req.session.save(function () {
        res.redirect("/post/".concat(req.params.id, "/edit"));
      });
    } else {
      //with permisstion but validation failed
      post.errors.forEach(function (err) {
        req.flash("errors", error);
      });
      req.session.save(function () {
        res.redirect("validation error");
      });
    }
  })["catch"](function (err) {
    req.flash("errors", "No permission");
    req.session.save(function () {
      res.redirect("/post/".concat(req.params.id, "/edit"));
    });
  });
};

exports["delete"] = function (req, res) {
  Post["delete"](req.params.id, req.visitorId).then(function () {
    req.flash("success", "successfully deleted");
    req.session.save(function () {
      res.redirect("/profile/".concat(req.session.user.username));
    });
  })["catch"](function () {
    req.flash("errors", "No permission");
    req.session.save(function () {
      res.redirect("/");
    });
  });
};

exports.search = function (req, res) {
  Post.search(req.body.searchTerm).then(function (posts) {
    res.json(posts);
  })["catch"](function (error) {
    res.json([]);
  });
};