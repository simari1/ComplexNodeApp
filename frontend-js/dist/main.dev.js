"use strict";

var _search = _interopRequireDefault(require("./modules/search"));

var _chat = _interopRequireDefault(require("./modules/chat"));

var _validateUserRegistration = _interopRequireDefault(require("./modules/validateUserRegistration"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import RegistrationForm from "./modules/registrationForm";
if ($(".header-search-icon")) {
  new _search["default"]();
}

if ($("#chat-wrapper")) {
  new _chat["default"]();
} // if ($("#registration-form")) {
//   new RegistrationForm();
// }


if ($("#registration-form")) {
  new _validateUserRegistration["default"]();
}