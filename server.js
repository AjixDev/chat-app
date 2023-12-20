const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const host = "localhost";
const port = 5000;
const appUrl = `http://${host}:${port}`;

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname + "/public")));

const chatHistoryFile = "chatHistory.json";

// Load chat history on server start
async function loadChatHistory() {
  try {
    const chatHistory = await fs.readFile(chatHistoryFile, "utf-8");
    return JSON.parse(chatHistory);
  } catch (err) {
    console.info(
      "\x1b[34mChat history file doesn't exist yet. It will be created when new messages are saved.\x1b[0m"
    );

    return []; // Start with an empty array if file doesn't exist
  }
}

// Save chat history to file
async function saveChatHistory(chatHistory) {
  try {
    await fs.writeFile(chatHistoryFile, JSON.stringify(chatHistory));
  } catch (err) {
    console.error("Error saving chat history:", err);
  }
}

// Load chat history on server start
loadChatHistory()
  .then((history) => {
    app.locals.chatHistory = history;
  })
  .catch((err) => {
    console.error("Error loading chat history:", err);
  });

//socket.io users login
io.on("connection", function (socket) {
  socket.on("newuser", function (username) {
    socket.broadcast.emit("update", username + " joined the chatroom");
  });
  socket.on("exituser", function (username) {
    socket.broadcast.emit("update", username + " left the chatroom");
  });

  socket.on("chat", (message) => {
    message.timestamp = new Date().toISOString(); // Add timestamp
    app.locals.chatHistory.push(message);

    // Save chat history to file
    saveChatHistory(app.locals.chatHistory);

    // Broadcast timestamped message to all clients
    socket.broadcast.emit("chat", message);
  });

  // Send history to new users
  socket.emit("history", app.locals.chatHistory);

  // Clear the chat history
  socket.on("disconnect", () => {
    io.emit("clearHistory"); // Broadcast clearHistory to all connected clients
  });
});

server.listen(port, () => {
  console.log("\x1b[32mServer running on port" + port + "\x1b[0m");
  console.log(`\x1b[34mOpen the app in your browser:\x1b[0m ${appUrl}`);
});
