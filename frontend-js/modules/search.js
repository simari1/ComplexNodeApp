import axios from "axios";
import DOMPurify from "dompurify";

export default class Search {
  constructor() {
    //Select DOM
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
  }

  //Events
  events() {
    this.inputField.on("keyup", () => {
      this.keyPressHandler();
    });

    this.closeIcon.on("click", () => {
      this.closeOverlay();
    });

    this.headerSearchIcon.on("click", (e) => {
      this.openOverlay();
      e.preventDefault();
    });
  }

  //Methods
  //live-search-results--visible

  keyPressHandler() {
    let value = this.inputField.val();
    this.showLoaderIcon();

    if (value == "") {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.hideResultsArea();
    }
    if (value && value != this.previousValue) {
      clearTimeout(this.typingWaitTimer);
      this.hideLoaderIcon();
      this.showResultsArea();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 700);
    }

    this.previousValue = value;
  }

  sendRequest() {
    axios
      .post("/search", { searchTerm: this.inputField.val() })
      .then((response) => {
        this.renderResultsHTML(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderResultsHTML(posts) {
    if (posts.length) {
      this.resultsArea.html(
        $(
          DOMPurify.sanitize(
            `<div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> 
            (${
              posts.length > 1 ? `${posts.length} items found` : "1 item found"
            })</div>
            ${posts
              .map((post) => {
                let postDate = new Date(post.createdDate);
                return `<a href="/post/${
                  post._id
                }" class="list-group-item list-group-item-action">
                          <img class="avatar-tiny" src="https://gravatar.com/avatar/${
                            post.author[0].avatar
                          }?s=128"> <strong>${post.title}</strong>
                          <span class="text-muted small">by ${
                            post.author[0].username
                          } 
                          on ${
                            postDate.getMonth() + 1
                          }/${postDate.getDay()}/${postDate.getFullYear()}</span></a>`;
              })
              .join("")}
          </div>`
          )
        )
      );
    } else {
      this.resultsArea.html(
        $(
          `
            <p class="alert alert-danger text-center shadow-sm">No results</p>
          `
        )
      );
      this.hideLoaderIcon();
      this.showResultsArea();
    }
  }

  showLoaderIcon() {
    this.loaderIcon.addClass("circle-loader--visible");
  }

  showResultsArea() {
    this.resultsArea.addClass("live-search-results--visible");
  }

  hideLoaderIcon() {
    this.loaderIcon.removeClass("circle-loader--visible");
  }

  hideResultsArea() {
    this.resultsArea.removeClass("live-search-results--visible");
  }

  openOverlay() {
    this.overlay.addClass("search-overlay--visible");
    setTimeout(() => {
      this.inputField.focus();
    }, 50);
  }

  closeOverlay() {
    this.overlay.removeClass("search-overlay--visible");
  }

  injectHTML() {
    $("body").append(
      $(
        `<div class="search-overlay">
          <div class="search-overlay-top shadow-sm">
            <div class="container container--narrow">;
              <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
              <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
              <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
            </div>
          </div>
      
          <div class="search-overlay-bottom">
            <div class="container container--narrow py-3">
              <div class="circle-loader"></div>
              <div class="live-search-results">
              </div>
            </div>
          </div>
        </div>`
      )
    );
  }
}
