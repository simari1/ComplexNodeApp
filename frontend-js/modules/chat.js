export default class Chat {
  constructor() {
    this.chatWrapper = $("#chat-wrapper");
    this.openIcon = $(".header-chat-icon");
    this.injectHTML();
    this.closeIcon = $(".chat-title-bar-close");
    this.chatField = $("#chatField");
    this.chatForm = $("#chatForm");
    this.events();
  }

  //Events
  events() {
    this.openIcon.on("click", () => this.showChat());
    this.openIcon.one("click", () => this.openConnection());
    this.closeIcon.on("click", () => this.hideChat());
    this.chatForm.on("submit", (e) => {
      this.sendMessageToServer();
      e.preventDefault();
    });
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
  }

  openConnection() {
    this.socket = io();
    this.socket.on("chatMessageFromServer", function(data){
      alert(data.message);
    })
  }

  hideChat() {
    this.chatWrapper.removeClass("chat--visible");
  }

  sendMessageToServer() {
    this.socket.emit("chatMessageFromBrowser", {
      message: this.chatField.val(),
    });
    this.chatField.val('');
  }
}
