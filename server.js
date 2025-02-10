const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const session = require("express-session");

const port = 80;

const app = express();
const httpServer = createServer(app);

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('users.db')

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (name TEXT, password TEXT)')
})

const sessionMiddleware = session({
  secret: "gd46sdf5",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
app.get("/login", (req, res) => {
  res.render("login", ok="")
});

app.post("/login", (req, res) => {
  db.get('SELECT name, password FROM users WHERE (name = ? AND password = ?)', req.body.name, req.body.password, (err, dbres) =>{
    if(dbres) {
      sid_to_player[req.sessionID].name = req.body.name
      sid_to_player[req.sessionID].guest = false
      res.render("login", {ok:"ok"})
    }
    else
      res.render("login", {ok:"wrong"})
  })
});

app.get("/register", (req, res) => {
  res.render("register")
});

app.post("/register", (req, res) => {
  console.log(req.body)
  const stmt = db.prepare('INSERT INTO users VALUES (?, ?)')
  stmt.run(req.body.name, req.body.password)
  stmt.finalize()
  res.render("register")
});



class Player {
  constructor(sid, name, roomid, guest) {
    this.sid = sid
    this.name = name;
    this.roomid = roomid
    this.guest = guest
  }
};

let sids = new Set()
let roomids = new Set()
let players = new Map()
let sid_to_player = new Map()
let names = new Set()

function rand_name() {
  let s = "Guest "
  let i = 0
  while(names.has(s+i))
    i+=1
  return s+i
}

function smallest() {
  let i=1;
  while(true) {
    if(!roomids.has(i))
      return i
    i+=1
  }
}

io.on("connect", socket => {
  const sid = socket.request.session.id;
  if(!sids.has(sid)) {
    let name = rand_name()
    names.add(name)
    sid_to_player[sid] = new Player(sid, name, null, true);
    sids.add(sid)
  }
  let player = sid_to_player[sid]
  let name = player.name

  for(const n of roomids) {
    socket.emit("newRoom", n);
  }

  socket.on("newRoom", () => {
    const n = smallest()
    players[n] = new Set()
    socket.emit("setRoom", n)
    socket.broadcast.emit("newRoom", n);
    roomids.add(n)
  })
  socket.on("joinRoom", n => {
    socket.join(`Room${n}`);
    if(!players[n])
      players[n] = new Set()
    for(const id of players[n]) {
      socket.emit("newPlayer", sid_to_player[id].name);
    }
    if(!players[n].has(sid)) {
      players[n].add(sid)
      io.to(`Room${n}`).emit("newPlayer", name);
    }
    sid_to_player[sid].roomid = n
  })
  socket.on("leaveRoom", () => {
    io.to(`Room${sid_to_player[sid].roomid}`).emit("delPlayer", player.name);
  })
});

httpServer.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
