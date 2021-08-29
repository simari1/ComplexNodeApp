import axios from "axios";

export default class ValidateUserRegistration {
  constructor() {
    this.form = $("#registration-form");
    this.validate();
  }

  // addMethod() {
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
  validate() {
    this.form.validate({
      debug: true,
      rules: {
        username: {
          required: true,
          minlength: 3,
          maxlength: 10,
          remote: {
            url: "/doesUserNameExist",
            type: "post",
            data: {
              username: function () {
                return $("#username-register").val();
              },
            },
          },
        },
        email: { required: true, email: true },
        password: { required: true, minlength: 3, maxlength: 10 },
      },
      // エラーメッセージ
      messages: {
        username: {
          required: "username is required",
          remote: "username already taken",
        },
        email: {
          required: "email is required",
          email: "not valid email",
        },
        password: {
          required: "password is required",
        },
      },
      errorPlacement: function (error, element) {
        error.insertBefore(element);
      },
      errorClass:
        "alert alert-danger small liveValidateMessage liveValidateMessage--visible",
      errorElement: "div",
      highlight: function (element, errorClass) {
        $(element).removeClass(errorClass);
      },
    });
  }
}
