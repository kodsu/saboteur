// Plik np. server.js

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const GameSupervisor = require("./logic-class");
const { render } = require('ejs');

let game = new GameSupervisor()
game.init_game()
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Konfiguracja ścieżek – serwujemy pliki statyczne
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pictures', express.static(path.join(__dirname, 'public', 'pictures')));

// Stan planszy (początkowo pusty)
let boardState = {};
let userCards = {}; // Przechowujemy karty dla każdego gracza
let playerBorders = {}; 
// let NumberofPlayers = 10;

// Lista dostępnych kart
const availableCards = [
    "E03.png", "E04.png", "E05.png", "E06.png", "E07.png", "E08.png"
];

io.on("connection", (socket) => {
    
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

    // Przygotowanie kart dla użytkownika
    userCards[socket.id] = availableCards; 

    socket.emit("init_cards", { n: availableCards.length ,cards: availableCards});

    // Wysyłamy aktualny stan planszy nowemu graczowi
    socket.emit("update_board", boardState);
   

    // Obsługa umieszczania karty na planszy
    socket.on("place_card", ({ fieldId, cardImage, rotation }) => { 
        // fieldId, cardImage, rotation -> 
        /* 
        20 + 3 * numer gracza  
        + 0 kilof 
        + 1 latarnia 
        
        + 2 wozek */  
        
        const start = 15; // Fixed start index for the card name
        const end = 18;   // Fixed end index for the card name
        const name = urlString.slice(start, end);
        let result = 0;     
        if(fieldId <= 90){
            result = game.ruch(fieldId / 11, fieldId %11, name, rotation); 
        }
        else 
        { 
            result = game.ruch(fieldId - 81, 0, name, rotation);   
        }
        for(let i = 1; i <= NumberofPlayers; i++){ 
            full_layout(result[0], result[1], result[2], result[3], i); 
            // musisz to komus wysłać 
        }
        if(game.check_end()) {
            game.koniec()
            game.turn++;
            if(game.turn == 3)
                io.emit("end")
        }
            
            
        // console.log(`Karta ${cardImage} umieszczona na ${fieldId}, rotacja: ${rotation}`);
        // boardState[fieldId] = { cardImage, rotation };
        // let name = cardImage.slice(-7); 

        // let index = userCards[socket.id].indexOf(name); 
        // console.log(name, userCards[socket.id]);
        // if(index !== -1){ 
        //     userCards[socket.id].splice(index, 1); 
        // } 
        // console.log(name, userCards[socket.id]); 
        
        // io.emit("init_cards", { n: userCards[socket.id].length, cards: userCards[socket.id] });
        // io.emit("update_board", boardState); 
    });

// kto -- czyj ruch 
// k -- czyje karty widac
   function full_layout(kto, plansza, rece, blokady, k){  // k in [0,9]
        let NumberofPlayers = rece.length; 
        for(let i = 1; i <= NumberofPlayers; i++) { 
            socket.emit("update_border", {playerId: i, isGreen: 0}); 
            socket.emit("update_cards_left", {playerId: i, number: rece[i-1].length}); 
        } 
        for(let i = 0; i < NumberofPlayers; i++){ 
            let mask_m = 1*blokady[3*i] + 2 * blokady[3*i + 1] + 4*blokady[3*i + 2]; 
            io.emit("update_blocks", {playerId: i+  1, mask: mask_m}); 
        }
        socket.emit("update_border", {playerId: kto+1, isGreen: 1}); 
        const updatedCards = rece[k].map(card => card + ".png");
        io.emit("init_cards", {n: updatedCards.length, cards: updatedCards });   
        for(let i = 0; i < 7; i++){ 
            for(let j = 0; j < 11; j++){ 
                socket.emit("set_card", {
                    fieldId: 11*i + j,
                    cardImage: "url(/pictures/" + plansza[i][j] +".png)",
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

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});





// testowy call full-layoutu: 
/* 

    full_layout(7, [
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00'
        ],
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'R00', 'F00'
        ],
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00'
        ],
        [
          'F00', 'S04', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'R00', 'F00'
        ],
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00'
        ],
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'R00', 'F00'
        ],
        [
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00', 'F00',
          'F00', 'F00'
        ]
      ], [
        [ 'B02', 'B05', 'E07', 'E02' ],
        [ 'B06', 'E12', 'B01', 'E03' ],
        [ 'E01', 'E07', 'E03', 'E09' ],
        [ 'E15', 'E05', 'E05', 'E15' ],
        [ 'E06', 'E03', 'E01', 'E11' ],
        [ 'E16', 'B07', 'B06', 'E13' ],
        [ 'E07', 'E06', 'B03', 'E05' ],
        [ 'E06', 'E02', 'E04', 'E06' ],
        [ 'B04', 'E05', 'E01', 'E14' ],
        [ 'E01', 'E07', 'E14', 'B05' ]
      ], [
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0
      ], 9); 
    console.log("Zrobiona robota!\n"); 
    game.init(10);
    socket.on("move", (move) => {
        ruch(move)
        render(game)
        if(game.check_end()) {
            game.koniec()
            game.turn++;
            if(game.turn == 3)
                io.emit("end")
        }
    }); */ 