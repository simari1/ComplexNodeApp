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
    .then(function (newId) {
      req.flash("success", "successfully created");
      req.session.save(function () {
        res.redirect(`/post/${newId}`);
      });
    })
    .catch(function (err) {
      err.forEach((e) => {
        req.flash("errors", e);
      });
      req.session.save(function () {
        res.redirect("/create-post");
      });
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
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
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

exports.delete = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "successfully deleted");
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`);
      });
    })
    .catch(() => {
      req.flash("errors", "No permission");
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.search = function (req, res) {
  Post.search(req.body.searchTerm)
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      res.json([]);
    });
};
