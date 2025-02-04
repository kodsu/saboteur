const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const session = require("express-session");

const port = 80;

const app = express();
const httpServer = createServer(app);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

const io = new Server(httpServer);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static("public"));
app.use(sessionMiddleware)
io.engine.use(sessionMiddleware);

app.get("/", (req, res) => res.render("index"));
app.get("/room/:n", (req, res) => {
  res.render("room", {"n":req.params.n})
});

let roomnums = new Set([]);
let players = {}
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
  const sessionId = socket.request.session.id;
  console.log(sessionId)
  socket.join(sessionId);

  for(const n of roomnums) {
    socket.emit("newRoom", n);
  }
  
  socket.on("newRoom", () => {
    const n = smallest()
    players[n] = []
    socket.emit("setRoom", n)
    socket.broadcast.emit("newRoom", n);
    roomnums.add(n)
  })
  socket.on("joinRoom", n => {
    const name = rand_name()
    console.log("join", n)
    for(const player of players[n]) {
      socket.emit("newPlayer", player);
    }
    players[n].push(sessionId)
    socket.to(`Room${n}`).emit("newPlayer", sessionId);
    socket.join(`Room${n}`);
  })
});

httpServer.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
