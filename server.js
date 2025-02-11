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
  db.run('CREATE TABLE IF NOT EXISTS users (name TEXT, password TEXT, games INT, wins INT)')
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

app.get("/", (req, res) => {
  if(req.session.log) {
    req.session.log = false
    res.render("index", {"guest":false, "text":"Zalogowano pomyślnie"})
  }
  else {
    res.render("index", {"guest":sid_to_player.get(req.sessionID)?.guest, "text":""})
  }
});
app.get("/game/:n", (req, res) => {
  res.render("game", {"guest":sid_to_player.get(req.sessionID)?.guest})
});

app.get("/profile", (req, res) => {
  db.get('SELECT name, wins, games FROM users WHERE name = ?', sid_to_player.get(req.sessionID)?.name, (err, dbres) =>{
    if(dbres) {
      res.render("profile", dbres)
    }
    else {
      res.redirect('/login')
    }
  })
});

app.get("/room/:n", (req, res) => {
  if(roomids.has(Number(req.params.n)))
    res.render("room", {"n":req.params.n, "guest":sid_to_player.get(req.sessionID)?.guest || false})
  else
    res.send('<img src="https://http.cat/404" />')
});
app.get("/login", (req, res) => {
  res.render("login", {"ok":"", "guest":false})
});

app.post("/login", (req, res) => {
  db.get('SELECT name, password FROM users WHERE (name = ? AND password = ?)', req.body.name, req.body.password, (err, dbres) =>{
    if(dbres) {
      sid_to_player.set(req.sessionID, new Player(req.sessionID, req.body.name, null, false))
      req.session.log = true
      res.redirect("/")
    }
    else {
      res.render("login", {"ok":"Złe dane", "guest":false})
    }
  })
});

app.get("/register", (req, res) => {
  res.render("register", {"ok":"","guest":false})
});

app.post("/register", (req, res) => {
  db.get('SELECT name FROM users WHERE name = ?', req.body.name, (err, dbres) =>{
    if(dbres) {
      res.render("register", {"ok":"Istnieje użytkownik o podanej nazwie", "guest":false})
    }
    else {
      req.session.log = true
      sid_to_player.set(req.sessionID, new Player(req.sessionID, req.body.name, null, false))
      const stmt = db.prepare('INSERT INTO users VALUES (?, ?, 0, 0)')
      stmt.run(req.body.name, req.body.password)
      stmt.finalize()
      res.redirect("/")
    }
  })
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
  if(!sid_to_player.has(sid)) {
    let name = rand_name()
    names.add(name)
    sid_to_player.set(sid, new Player(sid, name, null, true));
  }
  let player = sid_to_player.get(sid)
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
    n = Number(n)
    socket.join(`Room${n}`);
    if(!players[n])
      players[n] = new Set()
    for(const id of players[n]) {
      socket.emit("newPlayer", sid_to_player.get(id).name);
    }
    if(player.roomid) {
      players[player.roomid].delete(sid)
      if(players[player.roomid].size == 0) {
        roomids.delete(player.roomid)
        io.emit("delRoom", player.roomid)
      }
      io.to(`Room${player.roomid}`).emit("delPlayer", player.name);
    }
    if(!players[n].has(sid)) {
      players[n].add(sid)
      io.to(`Room${n}`).emit("newPlayer", name);
    }
    player.roomid = n
  })
  socket.on("leaveRoom", () => {
    players[player.roomid].delete(sid)
    io.to(`Room${player.roomid}`).emit("delPlayer", player.name);
    if(players[player.roomid].size == 0) {
      roomids.delete(player.roomid)
      io.emit("delRoom", player.roomid)
    }
  })

  socket.on("start", () => {
    socket.to(`Room${player.roomid}`).emit("start")
  })
});

httpServer.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
