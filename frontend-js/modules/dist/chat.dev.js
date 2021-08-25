"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
    }
  }, {
    key: "openConnection",
    value: function openConnection() {
      this.socket = io();
      this.socket.on("chatMessageFromServer", function (data) {
        alert(data.message);
      });
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
      this.chatField.val('');
    }
  }]);

  return Chat;
}();

exports["default"] = Chat;