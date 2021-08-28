"use strict";
import DOMPurify from "dompurify";

export default class Chat {
  constructor() {
    this.chatWrapper = $("#chat-wrapper");
    this.openIcon = $(".header-chat-icon");
    this.injectHTML();
    this.closeIcon = $(".chat-title-bar-close");
    this.chatField = $("#chatField");
    this.chatForm = $("#chatForm");
    this.chatLog = $("#chat");
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
    this.chatField.focus();
  }

  openConnection() {
    this.socket = io();

    this.socket.on("welcome", (data) => {
      this.username = data.username;
      this.avatar = data.avatar;
    });

    this.socket.on("chatMessageFromServer", (data) => {
      this.displayMessageFromServer(data);
    });
  }

  displayMessageFromServer(data) {
    this.chatLog.append(
      DOMPurify.sanitize(`
    <div class="chat-other">
      <a href="/profile/${data.username}"><img class="avatar-tiny" src="https://gravatar.com/avatar/${data.avatar}?s=128"></a>
      <div class="chat-message"><div class="chat-message-inner">
        <a href="/profile/${data.username}"><strong>${data.username}:</strong></a>
        ${data.message}
      </div></div>
    </div>
    `)
    );
    this.chatLog.get(0).scrollTop = this.chatLog.get(0).scrollHeight;
  }

  hideChat() {
    this.chatWrapper.removeClass("chat--visible");
  }

  sendMessageToServer() {
    this.socket.emit("chatMessageFromBrowser", {
      message: this.chatField.val(),
    });
    this.chatLog.append(`
    <div class="chat-self">
      <div class="chat-message">
        <div class="chat-message-inner">
          ${this.chatField.val()}
        </div>
      </div>
      <img class="chat-avatar avatar-tiny" src="https://gravatar.com/avatar/${
        this.avatar
      }?s=128">
    </div>
    `);

    this.chatLog.get(0).scrollTop = this.chatLog.get(0).scrollHeight;
    this.chatField.val("");
    this.chatField.focus();
  }
}
