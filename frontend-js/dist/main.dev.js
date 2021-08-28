"use strict";

var _search = _interopRequireDefault(require("./modules/search"));

var _chat = _interopRequireDefault(require("./modules/chat"));

var _registrationForm = _interopRequireDefault(require("./modules/registrationForm"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

if ($(".header-search-icon")) {
  new _search["default"]();
}

if ($("#chat-wrapper")) {
  new _chat["default"]();
}

if ($("#registration-form")) {
  new _registrationForm["default"]();
}