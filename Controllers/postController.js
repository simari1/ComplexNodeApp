"use strict";

const e = require("cors");
const Post = require("../Models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.create = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(function () {
      res.send("new");
    })
    .catch(function (err) {
      res.send(err);
    });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch (error) {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id);
    if (post.authorId == req.visitorId) {
      res.render("../Views/edit-post.ejs", {
        post: post,
      });
    } else {
      console.log("hi1");
      req.flash("errors", "no permission");
      req.session.save(function () {
        res.redirect("/");
      });
    }
  } catch (error) {
    res.render("../Views/404.ejs");
  }
};

exports.edit = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      if ((status = "success")) {
        req.flash("success", "updated successfully");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
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
    })
    .catch((err) => {
      req.flash("errors", "No permission");
      req.session.save(function () {
        res.redirect(`/post/${req.params.id}/edit`);
      });
    });
};
