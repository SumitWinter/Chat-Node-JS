const express = require("express");
const socket = require("socket.io");
// App setup
const PORT = process.env.PORT || 3000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`http://localhost:${PORT}`);
});


app.use(express.urlencoded());
// Static files
app.use(express.static("Public"))

// const fs = require("fs");
// const Home = fs.readFileSync('Public/index.html');

// Socket setup

// app.get("/", (req, res) => {
//     res.status(200).end(Home);
    const io = socket(server);

    const activeUsers = new Set();

    io.on("connection", function (socket) {
        console.log("Made socket connection");

        socket.on("new user", function (data) {
            socket.userId = data;
            activeUsers.add(data);
            io.emit("new user", [...activeUsers]);
        });

        socket.on("disconnect", () => {
            activeUsers.delete(socket.userId);
            io.emit("user disconnected", socket.userId);
        });

        socket.on("chat message", function (data) {
            io.emit("chat message", data);
        });

        socket.on("typing", function (data) {
            socket.broadcast.emit("typing", data);
        });

        socket.on("sent", function (data) {
            socket.broadcast.emit("sent", data);
        });
    });

