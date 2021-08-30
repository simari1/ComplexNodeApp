"use strict";

var express = require("express");

var apiRouter = express.Router();

var userController = require("../Controllers/userController");

var postController = require("../Controllers/postController");

var followController = require("../Controllers/followController");

var cors = require("cors");

apiRouter.use(cors());
apiRouter.post("/login", userController.apiLogin);
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreate);
apiRouter["delete"]("/post/:id", userController.apiMustBeLoggedIn, postController.apiDelete);
apiRouter.get("/postsByAuthor/:username", userController.apiGetPostsByUsername);
module.exports = apiRouter;