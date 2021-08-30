"use strict";

const User = require("../Models/User");
const Post = require("../Models/Post");
const Follow = require("../Models/Follow");
const jwt = require("jsonwebtoken");

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

exports.home = async function (req, res) {
  if (req.session.user) {
    //fetch feed of posts for current user
    let posts = await Post.getFeed(req.session.user._id);
    res.render("../Views/home-dashboard.ejs", { posts: posts });
  } else {
    //https://github.com/jaredhanson/connect-flash
    //https://stackoverflow.com/questions/64594683/avoid-req-flash-delete-data-on-middleware
    //req.flashで参照すると消えるので注意
    res.render("../Views/home-guest.ejs", {
      registrationErrors: req.flash("registrationErrors"),
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
      res.render("404");
    });
};

exports.sharedProfileData = async function (req, res, next) {
  let isVisitorsProfile = false;
  let isFollowing = false;

  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    );
  }

  req.isVisitorsProfile = isVisitorsProfile;
  req.isFollowing = isFollowing;

  //retrieve post, follower, following count
  let postCountPromise = Post.countPostsById(req.profileUser._id);
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id);
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id);
  let [postCount, followerCount, followingCount] = await Promise.all([
    postCountPromise,
    followerCountPromise,
    followingCountPromise,
  ]);

  req.postCount = postCount;
  req.followerCount = followerCount;
  req.followingCount = followingCount;

  next();
};

exports.profilePostsScreen = function (req, res) {
  Post.findPostsByAuthorId(req.profileUser._id)
    .then(function (posts) {
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
          followingCount: req.followingCount,
        },
        title: `Profile for ${req.profileUser.username}`,
      });
    })
    .catch(function () {
      res.render("404");
    });
};

exports.profileFollowersScreen = async function (req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id);
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
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};

exports.profileFollowingScreen = async function (req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id);
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
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};

exports.doesUserNameExist = async function (req, res) {
  let userExist = await User.checkExistenceByUsername(req.body.username);
  if (userExist === true) {
    res.send(false);
  } else {
    res.send(true);
  }
};

exports.apiLogin = function (req, res) {
  let user = new User(req.body);

  user
    .login()
    .then(function (result) {
      res.json(
        jwt.sign({ _id: user.data._id }, process.env.JWTSECRET, {
          expiresIn: "30m",
        })
      );
    })
    .catch(function (err) {
      res.json(err);
    });
};

//https://qiita.com/sa9ra4ma/items/67edf18067eb64a0bf40
//JWTのPayloadは暗号化されていない、あくまでBase64 Encodeされているだけなので、パスワードとか重要情報は含んではいけない
//署名は共通鍵暗号方式で暗号化されているからそれはenvファイルに外だししておく（鍵はサーバー側で管理しておく。署名を検証することによって、データの改ざんが行われていないかチェックすることができる。）
exports.apiMustBeLoggedIn = function (req, res, next) {
  try {
    console.log("apiMustBeLoggedIn1");
    req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET);
    console.log("apiMustBeLoggedIn2");
    next();
  } catch (error) {
    console.log("apiMustBeLoggedIn3" + error);
    res.json("login failed");
  }
};

exports.apiGetPostsByUsername = async function (req, res) {
  try {
    let authorDoc = await User.findByUsername(req.params.username);
    let posts = await Post.findPostsByAuthorId(authorDoc._id);
    res.json(posts);
  } catch (error) {
    res.json("invalid user");
  }
};
