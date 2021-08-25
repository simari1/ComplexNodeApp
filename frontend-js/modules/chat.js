export default class Chat {
  constructor() {
    this.openedYet;
    this.chatWrapper = $("#chat-wrapper");
    this.openIcon = $(".header-chat-icon");
    this.injectHTML();
    this.closeIcon = $(".chat-title-bar-close");
    this.events();
  }

  //Events
  events() {
    this.openIcon.on("click", () => this.showChat());
    this.openIcon.one("click", () => this.openConnection());
    this.closeIcon.on("click", () => this.hideChat());
  }

  //Methods
  injectHTML() {
    this.chatWrapper.append(
      `
      <div class="chat-title-bar">
        Chat
        <span class="chat-title-bar-close">
          <i class="fas fa-times-circle">
          </i>
        </span>
      </div>
      <div id="chat" class="chat-log"></div>
      
      <form id="chatForm" class="chat-form border-top">
        <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
      </form>
      `
    );
  }

  showChat() {
    this.chatWrapper.addClass("chat--visible");
    // if (!this.openedYet) {
    //   this.openConnection();
    //   this.openedYet = true;
    // }
  }

  openConnection() {
    alert("open");
  }

  hideChat() {
    this.chatWrapper.removeClass("chat--visible");
  }
}
