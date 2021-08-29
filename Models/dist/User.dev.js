"use strict";

var bcrypt = require("bcryptjs");

var usersCollection = require("../Utils/db").db("ComplexApp").collection("user");

var validator = require("validator");

var md5 = require("md5");

var User = function User(data, getAvatar) {
  this.data = data;
  this.errors = [];

  if (getAvatar == undefined) {
    getAvatar = false;
  } else {
    this.getAvatar();
  }
};

User.prototype.login = function () {
  var _this = this;

  return new Promise(function (resolve, reject) {
    _this.cleanUp();

    usersCollection.findOne({
      username: _this.data.username
    }).then(function (attemptedUser) {
      if (attemptedUser && bcrypt.compareSync(_this.data.password, attemptedUser.password)) {
        _this.data = attemptedUser;

        _this.getAvatar();

        resolve("Congrats!");
      } else {
        reject("Invalid username / password.");
      }
    })["catch"](function () {
      reject("Please try again later.");
    });
  });
};

User.prototype.register = function () {
  var _this2 = this;

  return new Promise(function _callee(resolve, reject) {
    var salt;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Step #1: Validate user data
            _this2.cleanUp();

            _context.next = 3;
            return regeneratorRuntime.awrap(_this2.validate());

          case 3:
            if (_this2.errors.length) {
              _context.next = 12;
              break;
            }

            // hash user password
            salt = bcrypt.genSaltSync(10);
            _this2.data.password = bcrypt.hashSync(_this2.data.password, salt);
            _context.next = 8;
            return regeneratorRuntime.awrap(usersCollection.insertOne(_this2.data));

          case 8:
            _this2.getAvatar();

            resolve();
            _context.next = 13;
            break;

          case 12:
            reject(_this2.errors);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    });
  });
}; //util methods


User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }

  if (typeof this.data.email != "string") {
    this.data.email = "";
  }

  if (typeof this.data.password != "string") {
    this.data.password = "";
  } // get rid of any bogus properties


  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  };
};

User.prototype.validate = function () {
  var _this3 = this;

  return new Promise(function _callee2(resolve, reject) {
    var usernameExists, emailExists;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_this3.data.username == "") {
              _this3.errors.push("You must provide a username.");
            }

            if (_this3.data.username != "" && !validator.isAlphanumeric(_this3.data.username)) {
              _this3.errors.push("Username can only contain letters and numbers.");
            }

            if (!validator.isEmail(_this3.data.email)) {
              _this3.errors.push("You must provide a valid email address.");
            }

            if (_this3.data.password == "") {
              _this3.errors.push("You must provide a password.");
            }

            if (_this3.data.password.length > 0 && _this3.data.password.length < 3) {
              _this3.errors.push("Password must be at least 3 characters.");
            }

            if (_this3.data.password.length > 50) {
              _this3.errors.push("Password cannot exceed 50 characters.");
            }

            if (_this3.data.username.length > 0 && _this3.data.username.length < 3) {
              _this3.errors.push("Username must be at least 3 characters.");
            }

            if (_this3.data.username.length > 30) {
              _this3.errors.push("Username cannot exceed 30 characters.");
            } // Only if username is valid then check to see if it's already taken


            if (!(_this3.data.username.length > 2 && _this3.data.username.length < 31 && validator.isAlphanumeric(_this3.data.username))) {
              _context2.next = 13;
              break;
            }

            _context2.next = 11;
            return regeneratorRuntime.awrap(usersCollection.findOne({
              username: _this3.data.username
            }));

          case 11:
            usernameExists = _context2.sent;

            if (usernameExists) {
              _this3.errors.push("That username is already taken.");
            }

          case 13:
            if (!validator.isEmail(_this3.data.email)) {
              _context2.next = 18;
              break;
            }

            _context2.next = 16;
            return regeneratorRuntime.awrap(usersCollection.findOne({
              email: _this3.data.email
            }));

          case 16:
            emailExists = _context2.sent;

            if (emailExists) {
              _this3.errors.push("That email is already being used.");
            }

          case 18:
            resolve();

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
};

User.prototype.getAvatar = function () {
  this.avatar = "https://gravatar.com/avatar/".concat(md5(this.data.email), "?s=128");
};

User.findByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      reject();
      return;
    }

    usersCollection.findOne({
      username: username
    }).then(function (userDocument) {
      if (userDocument) {
        userDocument = new User(userDocument, true);
        userDocument = {
          _id: userDocument.data._id,
          username: userDocument.data.username,
          avatar: userDocument.avatar
        };
        resolve(userDocument);
      } else {
        reject();
      }
    });
  });
};

User.checkExistenceByUsername = function (username) {
  return new Promise(function (resolve, reject) {
    if (typeof username != "string") {
      return false;
    }

    usersCollection.findOne({
      username: username
    }).then(function (userDocument) {
      if (userDocument === null) {
        resolve(false);
      } else {
        resolve(true);
      }
    })["catch"](function () {
      resolve(false);
    });
  });
};

module.exports = User;