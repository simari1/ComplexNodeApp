import axios from "axios";

export default class RegistrationForm {
  constructor() {
    this.allFields = $("#registration-form .form-control");
    this.insertValidationElements();
    this.username = $("#username-register");
    this.username.previousValue = "";
    this.events();

    //Email, passwordは同じなので省略
    this.email = $("#email-register");
    this.email.previousValue = "";
  }

  events() {
    this.username.on("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
  }

  //methods
  isDifferent(elem, handler) {
    if (elem.previousValue != elem.val()) {
      handler.call(this);
    }
    elem.previousValue = elem.val();
  }

  usernameHandler() {
    this.usernameImmediately();
    if (this.username.timer != null) {
      clearTimeout(this.username.timer);
    }
    this.username.timer = setTimeout(this.usernameAfterDelay, 1000, this);
  }

  usernameImmediately() {
    if (
      this.username.val() != "" &&
      !/^([a-zA-Z0-9]+)$/.test(this.username.val())
    ) {
      this.showValidationError(
        this.username,
        "Username can only contain letters and numbers"
      );
    } else {
      this.hideValidationError(this.username);
    }

    if (this.username.val().length > 30) {
      this.showValidationError(
        this.username,
        "Username not longer than 30 characters"
      );
    } else {
      this.hideValidationError(this.username);
    }
  }

  hideValidationError(el) {
    $(el.siblings("div")[0]).removeClass("liveValidateMessage--visible");
  }

  //なぜ動かないのか不明
  showValidationError(el, message) {
    $(el).siblings("div").first().text(message);
    $(el).siblings("div").first().addClass("liveValidateMessage--visible");
  }

  usernameAfterDelay(self) {
    if (self.username.val() != "" && self.username.val().length < 3) {
      self.showValidationError(
        self.username,
        "Username not shorter than 3 characters"
      );
    } else {
      self.hideValidationError(self.username);
    }

    axios
      .post("/doesUserNameExist", { username: self.username.val() })
      .then((response) => {
        if (response.data) {
          self.showValidationError($(self.username), "Username already taken");
          self.username.isUnique = false;
        } else {
          self.username.isUnique = true;
        }
      })
      .catch(() => {
        console.log("please try again later");
      });
  }

  insertValidationElements() {
    let dom = `<div class='alert alert-danger small liveValidateMessage'></div>`;
    this.allFields.each(function (index, elem) {
      $($(elem).parents()[0]).append(dom);
    });
  }
}
