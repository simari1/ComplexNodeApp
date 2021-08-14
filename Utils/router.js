const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
const postController = require("../Controllers/postController");
const { route } = require("../app");

//user related
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

//profile related
router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.profilePostsScreen
);

//post releated
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
);
router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
);
router.get("/post/:id", postController.viewSingle);
router.get("/post/:id/edit", postController.viewEditScreen);
router.post("/post/:id/edit", postController.edit);

module.exports = router;
