import axios from "axios";

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

    if (value && value != this.previousValue) {
      clearTimeout(this.typingWaitTimer);
      this.showLoaderIcon();
      this.typingWaitTimer = setTimeout(() => {
        this.sendRequest();
      }, 3000);
    }

    this.previousValue = value;
  }

  
  sendRequest() {
    console.log("starting ... " + this.inputField.val());

    axios
      .post("/search", { searchTerm: this.inputField.val() })
      .then((response) => {
        console.log("★★★" + response);
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  showLoaderIcon() {
    this.loaderIcon.addClass("circle-loader--visible");
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
                <div class="list-group shadow-sm">
                  <div class="list-group-item active"><strong>Search Results</strong> (4 items found)</div>
      
                  <a href="#" class="list-group-item list-group-item-action">
                    <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #1</strong>
                    <span class="text-muted small">by barksalot on 0/14/2019</span>
                  </a>
                  <a href="#" class="list-group-item list-group-item-action">
                    <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #2</strong>
                    <span class="text-muted small">by brad on 0/12/2019</span>
                  </a>
                  <a href="#" class="list-group-item list-group-item-action">
                    <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>Example Post #3</strong>
                    <span class="text-muted small">by barksalot on 0/14/2019</span>
                  </a>
                  <a href="#" class="list-group-item list-group-item-action">
                    <img class="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128"> <strong>Example Post #4</strong>
                    <span class="text-muted small">by brad on 0/12/2019</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>`
      )
    );
  }
}