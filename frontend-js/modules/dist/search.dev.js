"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _dompurify = _interopRequireDefault(require("dompurify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Search =
/*#__PURE__*/
function () {
  function Search() {
    _classCallCheck(this, Search);

    //Select DOM
    this._csrf = $("[name='_csrf']").val();
    this.injectHTML();
    this.headerSearchIcon = $(".header-search-icon");
    this.overlay = $(".search-overlay");
    this.closeIcon = $(".close-live-search");
    this.inputField = $("#live-search-field");
    this.resultsArea = $(".live-search-results");
    this.loaderIcon = $(".circle-loader");
    this.typingWaitTimer;
    this.previousValue = "";
    this.events();
  } //Events


  _createClass(Search, [{
    key: "events",
    value: function events() {
      var _this = this;

      this.inputField.on("keyup", function () {
        _this.keyPressHandler();
      });
      this.closeIcon.on("click", function () {
        _this.closeOverlay();
      });
      this.headerSearchIcon.on("click", function (e) {
        _this.openOverlay();

        e.preventDefault();
      });
    } //Methods

  }, {
    key: "keyPressHandler",
    value: function keyPressHandler() {
      var _this2 = this;

      var value = this.inputField.val();

      if (value == "") {
        clearTimeout(this.typingWaitTimer);
        this.hideLoaderIcon();
        this.hideResultsArea();
      }

      if (value && value != this.previousValue) {
        clearTimeout(this.typingWaitTimer);
        this.showLoaderIcon();
        this.showResultsArea();
        this.typingWaitTimer = setTimeout(function () {
          _this2.sendRequest();
        }, 1000);
      }

      this.previousValue = value;
    }
  }, {
    key: "sendRequest",
    value: function sendRequest() {
      var _this3 = this;

      //Postするときに_csrfをつけていればいい、受け取り側で何か処理する必要はなし
      _axios["default"].post("/search", {
        _csrf: this._csrf,
        searchTerm: this.inputField.val()
      }).then(function (response) {
        _this3.renderResultsHTML(response.data);
      })["catch"](function (error) {
        console.log(error);
      });
    }
  }, {
    key: "renderResultsHTML",
    value: function renderResultsHTML(posts) {
      if (posts.length) {
        this.resultsArea.html($(_dompurify["default"].sanitize("<div class=\"list-group shadow-sm\">\n            <div class=\"list-group-item active\"><strong>Search Results</strong> \n            (".concat(posts.length > 1 ? "".concat(posts.length, " items found") : "1 item found", ")</div>\n            ").concat(posts.map(function (post) {
          var postDate = new Date(post.createdDate);
          return "<a href=\"/post/".concat(post._id, "\" class=\"list-group-item list-group-item-action\">\n                          <img class=\"avatar-tiny\" src=\"https://gravatar.com/avatar/").concat(post.author[0].avatar, "?s=128\"> <strong>").concat(post.title, "</strong>\n                          <span class=\"text-muted small\">by ").concat(post.author[0].username, " \n                          on ").concat(postDate.getMonth() + 1, "/").concat(postDate.getDay(), "/").concat(postDate.getFullYear(), "</span></a>");
        }).join(""), "\n          </div>"))));
      } else {
        this.resultsArea.html($("\n            <p class=\"alert alert-danger text-center shadow-sm\">No results</p>\n          "));
        this.hideLoaderIcon();
        this.showResultsArea();
      }
    }
  }, {
    key: "showLoaderIcon",
    value: function showLoaderIcon() {
      this.loaderIcon.addClass("circle-loader--visible");
    }
  }, {
    key: "showResultsArea",
    value: function showResultsArea() {
      this.resultsArea.addClass("live-search-results--visible");
    }
  }, {
    key: "hideLoaderIcon",
    value: function hideLoaderIcon() {
      this.loaderIcon.removeClass("circle-loader--visible");
    }
  }, {
    key: "hideResultsArea",
    value: function hideResultsArea() {
      this.resultsArea.removeClass("live-search-results--visible");
    }
  }, {
    key: "openOverlay",
    value: function openOverlay() {
      var _this4 = this;

      this.overlay.addClass("search-overlay--visible");
      setTimeout(function () {
        _this4.inputField.focus();
      }, 50);
    }
  }, {
    key: "closeOverlay",
    value: function closeOverlay() {
      this.overlay.removeClass("search-overlay--visible");
    }
  }, {
    key: "injectHTML",
    value: function injectHTML() {
      $("body").append($("<div class=\"search-overlay\">\n          <div class=\"search-overlay-top shadow-sm\">\n            <div class=\"container container--narrow\">;\n              <label for=\"live-search-field\" class=\"search-overlay-icon\"><i class=\"fas fa-search\"></i></label>\n              <input type=\"text\" id=\"live-search-field\" class=\"live-search-field\" placeholder=\"What are you interested in?\">\n              <span class=\"close-live-search\"><i class=\"fas fa-times-circle\"></i></span>\n            </div>\n          </div>\n      \n          <div class=\"search-overlay-bottom\">\n            <div class=\"container container--narrow py-3\">\n              <div class=\"circle-loader\"></div>\n              <div class=\"live-search-results\">\n              </div>\n            </div>\n          </div>\n        </div>"));
    }
  }]);

  return Search;
}();

exports["default"] = Search;