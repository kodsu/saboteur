const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const session = require("express-session");
const GameSupervisor = require("./logic-class");

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
    res.render("main", {"guest":false, "text":"Zalogowano pomyślnie"})
  }
  else {
    res.render("main", {"guest":sid_to_player.get(req.sessionID)?.guest, "text":""})
  }
});
app.get("/game/:n", (req, res) => {
  res.sendFile("public/game.html", {root: __dirname})
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
  if(req.body.op == "Zaloguj się") {
    db.get('SELECT name, password FROM users WHERE (name = ? AND password = ?)', req.body.name, req.body.password, (err, dbres) =>{
      if(dbres) {
        sid_to_player.set(req.sessionID, new Player(req.sessionID, req.body.name, null, false, null))
        req.session.log = true
        res.redirect("/")
      }
      else {
        res.render("login", {"ok":"Złe dane", "guest":false})
      }
    })
  }
  else {
    db.get('SELECT name FROM users WHERE name = ?', req.body.name, (err, dbres) =>{
      if(dbres) {
        res.render("register", {"ok":"Istnieje użytkownik o podanej nazwie", "guest":false})
      }
      else {
        req.session.log = true
        sid_to_player.set(req.sessionID, new Player(req.sessionID, req.body.name, null, false, null))
        const stmt = db.prepare('INSERT INTO users VALUES (?, ?, 0, 0)')
        stmt.run(req.body.name, req.body.password)
        stmt.finalize()
        res.redirect("/")
      }
    })
  }
});

class Player {
  constructor(sid, name, roomid, guest, turn) {
    this.sid = sid
    this.name = name;
    this.roomid = roomid
    this.guest = guest
    this.turn = turn
  }
};

let sids = new Set()
let roomids = new Set()
let roomready = new Map()
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

let game = new GameSupervisor()
game.init_game()

io.on("connect", socket => {
  const sid = socket.request.session.id;
  if(!sid_to_player.has(sid)) {
    let name = rand_name()
    names.add(name)
    sid_to_player.set(sid, new Player(sid, name, null, true, null));
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
    player.turn = players[n].size
    console.log(player.turn)
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
    let result = game.init(2)  
    socket.to(`Room${player.roomid}`).emit("start")
    full_layout(result[0], result[1], result[2], result[3], player.turn);  
  })

  socket.on("ready", () => {
    full_layout(game.kto, game.plansza, game.rece, game.blokady, player.turn);  
  })
      
  console.log("Użytkownik połączony:", socket.id);
    
  socket.on("set_border", ({ playerId, isGreen }) => {
      console.log(`Zmiana obramowania dla gracza ${playerId}: ${isGreen ? "zielone" : "brak"}`);
      
      playerBorders[playerId] = isGreen;
  
      io.emit("update_border", { playerId, isGreen });
  }); 

  

  
  // let GameStarter = 9; 
  // for(let i = 1; i <= 10; i++){ 
  //     socket.emit("update_border", {playerId: i, isGreen: 0});  
  //     socket.emit("update_cards_left", {playerId: i, number: i}); 
  //     socket.emit("update_blocks", {playerId: i, mask: i%8}); 
  // }
  // socket.emit("update_gold", {gold:1}); 
  // socket.emit("update_border", {playerId: GameStarter, isGreen: 1});  

  
  socket.on("init_cards", ({ n, cards }) => {
      const bottomCardsContainer = document.querySelector(".bottom-cards");
      bottomCardsContainer.innerHTML = ""; // Czyścimy stare karty
      
      cards.forEach(cardName => {
          const cardElem = document.createElement("div");
          cardElem.classList.add("card");
          cardElem.style.backgroundImage = `url('/pictures/${cardName}')`;
          cardElem.dataset.image = cardName;
          
          cardElem.addEventListener("click", function() {
              selectCard(cardElem);
          });
              
          bottomCardsContainer.appendChild(cardElem);
      });
  });
 
  // Obsługa umieszczania karty na planszy
  socket.on("place_card", ({ fieldId, cardImage, rotation }) => { 
      // fieldId, cardImage, rotation -> 
      /* 
      20 + 3 * numer gracza  
      + 0 kilof 
      + 1 latarnia 
      
      + 2 wozek */
      console.log(game.kto, player.turn)
      if(game.kto != player.turn)
        return;
      const start = cardImage.length-7; // Fixed start index for the card name
      const end = cardImage.length-4;   // Fixed end index for the card name
      const name = cardImage.slice(start, end);
      fieldId = parseInt(fieldId.slice(6, fieldId.length))
      let result = 0;     
      if(fieldId <= 90){
          console.log(Math.floor(fieldId / 11), fieldId %11, name, rotation, 0)
          result = game.ruch(Math.floor(fieldId / 11), fieldId %11, name, rotation, 0); 
      }
      else 
      { 
          console.log(fieldId - 81, 0, name, rotation)
          result = game.ruch(fieldId - 81, 0, name, rotation, 0);   
      }  
      
      full_layout(result[0], result[1], result[2], result[3], player.turn);

      if(game.check_end()) {
          game.koniec()
          game.turn++;
          if(game.turn == 3)
              io.emit("end")
      }
          
      
  });

// kto -- czyj ruch 
// k -- czyje karty widac
 function full_layout(kto, plansza, rece, blokady, k){  // k in [0,9]
      console.log(kto, plansza, rece, blokady, k)
      let NumberofPlayers = rece.length; 
      for(let i = 1; i <= NumberofPlayers; i++) { 
          io.emit("update_border", {playerId: i, isGreen: 0}); 
          io.emit("update_cards_left", {playerId: i, number: rece[i-1].length}); 
      } 
      for(let i = 0; i < NumberofPlayers; i++){ 
          let mask_m = 1*blokady[3*i] + 2 * blokady[3*i + 1] + 4*blokady[3*i + 2]; 
          io.emit("update_blocks", {playerId: i+  1, mask: mask_m}); 
      }
      io.emit("update_border", {playerId: kto+1, isGreen: 1}); 
      const updatedCards = rece[k].map(card =>  card + ".png");
      socket.emit("init_cards", {n: updatedCards.length, cards: updatedCards });   
      // co sie dzieje ? 
      for(let i = 0; i < 7; i++){ 
          for(let j = 0; j < 11; j++){  
              //console.log(`Pole ${i} ${j} w printowaniu`); 
              io.emit("set_card", {
                  fieldId: 11*i + j,
                  cardImage: "url('/pictures/" + plansza[i][j] +".png')",
              });
          }
      } 
 }

  socket.on("rotate_card", ({ cardImage, rotation }) => {
      console.log(`Otrzymano informację o obrocie karty ${cardImage} na ${rotation} stopni`);
      // Jeśli chcesz, możesz tu wykonać dodatkowe operacje lub rozesłać event potwierdzający:
      // io.emit("card_rotated", { cardImage, rotation });
  });

  socket.on("disconnect", () => {
      console.log("Użytkownik rozłączony:", socket.id);
  });
});

httpServer.listen(port, () =>
  console.log(`app listening at http://localhost:${port}`)
);
