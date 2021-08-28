"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dompurify = _interopRequireDefault(require("dompurify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Chat =
/*#__PURE__*/
function () {
  function Chat() {
    _classCallCheck(this, Chat);

    this.chatWrapper = $("#chat-wrapper");
    this.openIcon = $(".header-chat-icon");
    this.injectHTML();
    this.closeIcon = $(".chat-title-bar-close");
    this.chatField = $("#chatField");
    this.chatForm = $("#chatForm");
    this.chatLog = $("#chat");
    this.events();
  } //Events


  _createClass(Chat, [{
    key: "events",
    value: function events() {
      var _this = this;

      this.openIcon.on("click", function () {
        return _this.showChat();
      });
      this.openIcon.one("click", function () {
        return _this.openConnection();
      });
      this.closeIcon.on("click", function () {
        return _this.hideChat();
      });
      this.chatForm.on("submit", function (e) {
        _this.sendMessageToServer();

        e.preventDefault();
      });
    } //Methods

  }, {
    key: "injectHTML",
    value: function injectHTML() {
      this.chatWrapper.append("\n      <div class=\"chat-title-bar\">\n        Chat\n        <span class=\"chat-title-bar-close\">\n          <i class=\"fas fa-times-circle\">\n          </i>\n        </span>\n      </div>\n      <div id=\"chat\" class=\"chat-log\"></div>\n      \n      <form id=\"chatForm\" class=\"chat-form border-top\">\n        <input type=\"text\" class=\"chat-field\" id=\"chatField\" placeholder=\"Type a message\u2026\" autocomplete=\"off\">\n      </form>\n      ");
    }
  }, {
    key: "showChat",
    value: function showChat() {
      this.chatWrapper.addClass("chat--visible");
      this.chatField.focus();
    }
  }, {
    key: "openConnection",
    value: function openConnection() {
      var _this2 = this;

      this.socket = io();
      this.socket.on("welcome", function (data) {
        _this2.username = data.username;
        _this2.avatar = data.avatar;
      });
      this.socket.on("chatMessageFromServer", function (data) {
        _this2.displayMessageFromServer(data);
      });
    }
  }, {
    key: "displayMessageFromServer",
    value: function displayMessageFromServer(data) {
      this.chatLog.append(_dompurify["default"].sanitize("\n    <div class=\"chat-other\">\n      <a href=\"/profile/".concat(data.username, "\"><img class=\"avatar-tiny\" src=\"https://gravatar.com/avatar/").concat(data.avatar, "?s=128\"></a>\n      <div class=\"chat-message\"><div class=\"chat-message-inner\">\n        <a href=\"/profile/").concat(data.username, "\"><strong>").concat(data.username, ":</strong></a>\n        ").concat(data.message, "\n      </div></div>\n    </div>\n    ")));
      this.chatLog.get(0).scrollTop = this.chatLog.get(0).scrollHeight;
    }
  }, {
    key: "hideChat",
    value: function hideChat() {
      this.chatWrapper.removeClass("chat--visible");
    }
  }, {
    key: "sendMessageToServer",
    value: function sendMessageToServer() {
      this.socket.emit("chatMessageFromBrowser", {
        message: this.chatField.val()
      });
      this.chatLog.append("\n    <div class=\"chat-self\">\n      <div class=\"chat-message\">\n        <div class=\"chat-message-inner\">\n          ".concat(this.chatField.val(), "\n        </div>\n      </div>\n      <img class=\"chat-avatar avatar-tiny\" src=\"https://gravatar.com/avatar/").concat(this.avatar, "?s=128\">\n    </div>\n    "));
      this.chatLog.get(0).scrollTop = this.chatLog.get(0).scrollHeight;
      this.chatField.val("");
      this.chatField.focus();
    }
  }]);

  return Chat;
}();

exports["default"] = Chat;