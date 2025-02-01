const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = 8080;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));

app.get("/", (req, res) => res.render("index"));
app.get("/room/:n", (req, res) => {
  res.render("room", {"n":req.params.n})
  // socket.emit("joinRoom", req.params.n);
});

let roomnums = new Set([]);
let names = new Set([]);

const characters = "abcdefghijklmnopqrstuvwxyz0123456789"

function rand_name() {
  let s = "Guest "
  for(let i=0; i<5; i++)
    s += characters[Math.floor(Math.random() * characters.length)]
  return s
}

function smallest() {
  let i=1;
  while(true) {
    if(!roomnums.has(i))
      return i
    i+=1
  }
}

io.on("connect", socket => {
  for(const n of roomnums) {
    socket.emit("addRoom", n);
  }
  socket.on("newRoom", data => {
    const n = smallest()
    socket.emit("setRoom", n)
    socket.broadcast.emit("addRoom", n);
    roomnums.add(n)
  })
  socket.on("joinRoom", n => {
    const name = rand_name()
    socket.to(`Room${n}`).emit("newPlayer", name);
    socket.join(`Room${n}`);
  })
});

server.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
