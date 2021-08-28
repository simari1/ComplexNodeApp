"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RegistrationForm =
/*#__PURE__*/
function () {
  function RegistrationForm() {
    _classCallCheck(this, RegistrationForm);

    this.allFields = $("#registration-form .form-control");
    this.insertValidationElements();
    this.username = $("#username-register");
    this.username.previousValue = "";
    this.events(); //Email, passwordは同じなので省略

    this.email = $("#email-register");
    this.email.previousValue = "";
  }

  _createClass(RegistrationForm, [{
    key: "events",
    value: function events() {
      var _this = this;

      this.username.on("keyup", function () {
        _this.isDifferent(_this.username, _this.usernameHandler);
      });
    } //methods

  }, {
    key: "isDifferent",
    value: function isDifferent(elem, handler) {
      if (elem.previousValue != elem.val()) {
        handler.call(this);
      }

      elem.previousValue = elem.val();
    }
  }, {
    key: "usernameHandler",
    value: function usernameHandler() {
      this.usernameImmediately();

      if (this.username.timer != null) {
        clearTimeout(this.username.timer);
      }

      this.username.timer = setTimeout(this.usernameAfterDelay, 1000, this);
    }
  }, {
    key: "usernameImmediately",
    value: function usernameImmediately() {
      if (this.username.val() != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.val())) {
        this.showValidationError(this.username, "Username can only contain letters and numbers");
      } else {
        this.hideValidationError(this.username);
      }

      if (this.username.val().length > 30) {
        this.showValidationError(this.username, "Username not longer than 30 characters");
      } else {
        this.hideValidationError(this.username);
      }
    }
  }, {
    key: "hideValidationError",
    value: function hideValidationError(el) {
      $(el.siblings("div")[0]).removeClass("liveValidateMessage--visible");
    } //なぜ動かないのか不明

  }, {
    key: "showValidationError",
    value: function showValidationError(el, message) {
      $(el).siblings("div").first().text(message);
      $(el).siblings("div").first().addClass("liveValidateMessage--visible");
    }
  }, {
    key: "usernameAfterDelay",
    value: function usernameAfterDelay(self) {
      if (self.username.val() != "" && self.username.val().length < 3) {
        self.showValidationError(self.username, "Username not shorter than 3 characters");
      } else {
        self.hideValidationError(self.username);
      }

      _axios["default"].post("/doesUserNameExist", {
        username: self.username.val()
      }).then(function (response) {
        if (response.data) {
          self.showValidationError($(self.username), "Username already taken");
          self.username.isUnique = false;
        } else {
          self.username.isUnique = true;
        }
      })["catch"](function () {
        console.log("please try again later");
      });
    }
  }, {
    key: "insertValidationElements",
    value: function insertValidationElements() {
      var dom = "<div class='alert alert-danger small liveValidateMessage'></div>";
      this.allFields.each(function (index, elem) {
        $($(elem).parents()[0]).append(dom);
      });
    }
  }]);

  return RegistrationForm;
}();

exports["default"] = RegistrationForm;