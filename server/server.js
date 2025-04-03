// server.js
// const next = require('next');
// const { initializeSocketServer } = require('./socket');
// const http = require('http');
// const express = require('express');
// const {Server} = require('socket.io');
// const app = express();

// const server = http.createServer(app); // HTTPサーバーを作成
// const io = new Server(server);
//
// const PORT = 5000;
//
// server.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // サーバーを起動
//
// io.on('connect', (socket) => {
//     console.log("クライアントと接続")
//     socket.on("disconnect", (code) => {
//         console.log("クライアントと切断")
//     })
//
// })

//
// app.prepare().then(() => {
//     const server = createServer((req, res) => {
//         const parsedUrl = parse(req.url, true);
//         handle(req, res, parsedUrl);
//     });
//
//     // Socket.ioサーバーを初期化
//     // const io = initializeSocketServer(server);
//
//     server.listen(process.env.PORT || 3000, (err) => {
//         if (err)console.log(err);
//         console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
//     });
// });