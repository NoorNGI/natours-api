import http from "http";

const server = http.createServer((req, res) => {
  console.log("Hello from the server.");
  res.end("Hello from the server");
});

server.listen(8000, (err) => {
  console.log("server is listening on port 8000");
});
