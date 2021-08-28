"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var User = require("../Models/User");

var Post = require("../Models/Post");

var Follow = require("../Models/Follow");

exports.login = function (req, res) {
  var user = new User(req.body);
  user.login().then(function (result) {
    req.session.user = {
      username: req.body.username,
      avatar: user.avatar,
      _id: user.data._id
    };
    req.session.save(function () {
      res.redirect("/");
    });
  })["catch"](function (err) {
    req.flash("errors", err);
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
  var user = new User(req.body);
  user.register().then(function () {
    req.session.user = {
      username: user.data.username,
      avatar: user.avatar,
      _id: user.data._id
    };
    req.session.save(function () {
      res.redirect("/");
    });
  })["catch"](function (registrationErrors) {
    registrationErrors.forEach(function (err) {
      req.flash("registrationErrors", err);
    });
    req.session.save(function () {
      res.redirect("/");
    });
  });
};

exports.home = function _callee(req, res) {
  var posts;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!req.session.user) {
            _context.next = 7;
            break;
          }

          _context.next = 3;
          return regeneratorRuntime.awrap(Post.getFeed(req.session.user._id));

        case 3:
          posts = _context.sent;
          res.render("../Views/home-dashboard.ejs", {
            posts: posts
          });
          _context.next = 8;
          break;

        case 7:
          //https://github.com/jaredhanson/connect-flash
          //https://stackoverflow.com/questions/64594683/avoid-req-flash-delete-data-on-middleware
          //req.flashで参照すると消えるので注意
          res.render("../Views/home-guest.ejs", {
            registrationErrors: req.flash("registrationErrors")
          });

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
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
  User.findByUsername(req.params.username).then(function (userDocument) {
    req.profileUser = userDocument;
    next();
  })["catch"](function () {
    res.render("404");
  });
};

exports.sharedProfileData = function _callee2(req, res, next) {
  var isVisitorsProfile, isFollowing, postCountPromise, followerCountPromise, followingCountPromise, _ref, _ref2, postCount, followerCount, followingCount;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          isVisitorsProfile = false;
          isFollowing = false;

          if (!req.session.user) {
            _context2.next = 7;
            break;
          }

          isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
          _context2.next = 6;
          return regeneratorRuntime.awrap(Follow.isVisitorFollowing(req.profileUser._id, req.visitorId));

        case 6:
          isFollowing = _context2.sent;

        case 7:
          req.isVisitorsProfile = isVisitorsProfile;
          req.isFollowing = isFollowing; //retrieve post, follower, following count

          postCountPromise = Post.countPostsById(req.profileUser._id);
          followerCountPromise = Follow.countFollowersById(req.profileUser._id);
          followingCountPromise = Follow.countFollowingById(req.profileUser._id);
          _context2.next = 14;
          return regeneratorRuntime.awrap(Promise.all([postCountPromise, followerCountPromise, followingCountPromise]));

        case 14:
          _ref = _context2.sent;
          _ref2 = _slicedToArray(_ref, 3);
          postCount = _ref2[0];
          followerCount = _ref2[1];
          followingCount = _ref2[2];
          req.postCount = postCount;
          req.followerCount = followerCount;
          req.followingCount = followingCount;
          next();

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.profilePostsScreen = function (req, res) {
  Post.findPostsByAuthorId(req.profileUser._id).then(function (posts) {
    res.render("profile", {
      currentPage: "posts",
      posts: posts,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount
      },
      title: "Profile for ".concat(req.profileUser.username)
    });
  })["catch"](function () {
    res.render("404");
  });
};

exports.profileFollowersScreen = function _callee3(req, res) {
  var followers;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(Follow.getFollowersById(req.profileUser._id));

        case 3:
          followers = _context3.sent;
          res.render("profile-followers", {
            currentPage: "followers",
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
              postCount: req.postCount,
              followerCount: req.followerCount,
              followingCount: req.followingCount
            }
          });
          _context3.next = 10;
          break;

        case 7:
          _context3.prev = 7;
          _context3.t0 = _context3["catch"](0);
          res.render("404");

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.profileFollowingScreen = function _callee4(req, res) {
  var following;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Follow.getFollowingById(req.profileUser._id));

        case 3:
          following = _context4.sent;
          res.render("profile-following", {
            currentPage: "following",
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
              postCount: req.postCount,
              followerCount: req.followerCount,
              followingCount: req.followingCount
            }
          });
          _context4.next = 10;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          res.render("404");

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
};