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

var ValidateUserRegistration =
/*#__PURE__*/
function () {
  function ValidateUserRegistration() {
    _classCallCheck(this, ValidateUserRegistration);

    this.form = $("#registration-form");
    this.validate();
  } // addMethod() {
  //   $.validator.addMethod("doesUserNameExist", async function (value, element) {
  //     let result = false;
  //     await axios
  //       .post("/doesUserNameExist", { username: value })
  //       .then((response) => {
  //         console.log(response.data);
  //         if (response.data === true) {
  //           result = false;
  //         } else {
  //           result = false;
  //         }
  //       })
  //       .catch(() => {
  //         result = false;
  //       });
  //     return result;
  //   });
  // }
  //methods


  _createClass(ValidateUserRegistration, [{
    key: "validate",
    value: function validate() {
      this.form.validate({
        // debug: true,
        rules: {
          username: {
            required: true,
            minlength: 3,
            maxlength: 10,
            remote: {
              url: "/doesUserNameExist",
              type: "post",
              data: {
                username: function username() {
                  return $("#username-register").val();
                },
                //jquery validationに_csrfを渡すと動いた！
                _csrf: function _csrf() {
                  return $("[name='_csrf']").val();
                }
              }
            }
          },
          email: {
            required: true,
            email: true
          },
          password: {
            required: true,
            minlength: 3,
            maxlength: 10
          }
        },
        // エラーメッセージ
        messages: {
          username: {
            required: "username is required",
            remote: "username already taken"
          },
          email: {
            required: "email is required",
            email: "not valid email"
          },
          password: {
            required: "password is required"
          }
        },
        errorPlacement: function errorPlacement(error, element) {
          error.insertBefore(element);
        },
        errorClass: "alert alert-danger small liveValidateMessage liveValidateMessage--visible",
        errorElement: "div",
        highlight: function highlight(element, errorClass) {
          $(element).removeClass(errorClass);
        },
        //jquery validationを使った場合はsubmitは自分でやってやる必要がある
        //https://jqueryvalidation.org/validate/#submithandler
        //https://stackoverflow.com/questions/14366899/submit-handler-not-working
        submitHandler: function submitHandler(form) {
          form.submit();
        }
      });
    }
  }]);

  return ValidateUserRegistration;
}();

exports["default"] = ValidateUserRegistration;