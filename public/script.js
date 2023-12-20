(function () {
  const app = document.querySelector(".app");
  const socket = io();

  let uname;

  // Join button functionality
  app
    .querySelector(".join-screen #join-user")
    .addEventListener("click", joinUser);
  app
    .querySelector(".join-screen #username")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission if applicable
        joinUser();
      }
    });

  function joinUser() {
    let username = app.querySelector(".join-screen #username").value;
    if (username.length == 0) {
      return;
    }
    socket.emit("newuser", username);
    uname = username;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
  }

  // Send button functionality
  app
    .querySelector(".chat-screen #send-message")
    .addEventListener("click", sendMessage);
  app
    .querySelector(".chat-screen #message-input")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission behavior
        sendMessage();
      }
    });

  function sendMessage() {
    let message = app.querySelector(".chat-screen #message-input").value;
    if (message.length == 0) {
      return;
    }
    renderMessage("my", {
      username: uname,
      text: message,
    });
    socket.emit("chat", {
      username: uname,
      text: message,
    });
    app.querySelector(".chat-screen #message-input").value = "";
  }

  // Exit button functionality
  app
    .querySelector(".chat-screen #exit-chat")
    .addEventListener("click", function () {
      socket.emit("exituser", uname);
      window.location.href = window.location.href;
    });

  // Update my message socket
  socket.on("update", function (update) {
    renderMessage("update", update);
  });

  // Update others message socket
  socket.on("chat", function (message) {
    renderMessage("other", message);
  });

  // Render messages to the DOM
  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".chat-screen .messages");
    // My messages
    if (type == "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
          <div>
            <div class="name">You</div>
            <div class="text">${message.text}</div>
          </div>
        `;
      messageContainer.appendChild(el);
      // Others messages
    } else if (type == "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
          <div>
            <div class="name">${message.username}</div>
            <div class="text">${message.text}</div>
          </div>
        `;
      messageContainer.appendChild(el);
      // Update messages to the messageContainer
    } else if (type == "update") {
      let el = document.createElement("div");
      el.setAttribute("class", "update");
      el.innerText = message;
      messageContainer.appendChild(el);
    }
    // scroll chat to end
    messageContainer.scrolTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }
})();
