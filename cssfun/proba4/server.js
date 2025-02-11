// Plik np. server.js

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const GameSupervisor = require("./logic-class");
const { render } = require('ejs');
const { result } = require('lodash');


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

   
    
    let result = game.init(10)  
    // result[4] -- roles   
    globalRoles = result[3]; 
    console.log(result);
    console.log(globalRoles);  
    
    // [0, 1, 0, 1, ]
    //  console.log("initial rzeczy -- ", result) 

    
 
    console.log(globalRoles)
    full_layout(result[0], result[1], result[2], result[3], result[0]);  
    // jak zrobić result[4] roles 
    
    
    let currentRotation = 0; 

    socket.on("place_card", ({ fieldId, cardImage, rotation }) => { 
        // fieldId, cardImage, rotation -> 
        /* 
        20 + 3 * numer gracza  
        + 0 kilof 
        + 1 latarnia 
        
        + 2 wozek */
        let rotation2 = currentRotation; // Uwaga rotation z argumentu to bullshit licze wywolania lokalnie 
        // pomiedzy rotate_card i set_card
        const start = cardImage.length-7; // Fixed start index for the card name
        const end = cardImage.length-4;   // Fixed end index for the card name
        const name = cardImage.slice(start, end);
        fieldId = parseInt(fieldId.slice(6, fieldId.length))
        let result = 0;     
        if(fieldId <= 90){
            console.log(Math.floor(fieldId / 11), fieldId %11, name, rotation2, 0)
            result = game.ruch(Math.floor(fieldId / 11), fieldId %11, name, rotation2, 0); 
        }
        else 
        { 
            console.log(fieldId - 81, 0, name, rotation2)
            result = game.ruch(fieldId - 81, 0, name, rotation2, 0);   
        }  
        
        full_layout(result[0], result[1], result[2], result[3], result[0]);
        currentRotation = 0; 
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

    socket.emit('set_image', globalRoles[k] + ".png"); 

        const updatedCards = rece[k].map(card =>  card + ".png"); 
        
        io.emit("init_cards", {n: updatedCards.length, cards: updatedCards });   
        // co sie dzieje ? 
        for(let i = 0; i < 7; i++){ 
            for(let j = 0; j < 11; j++){  
                //console.log(`Pole ${i} ${j} w printowaniu`); 
                socket.emit("set_card", {
                    fieldId: 11*i + j,
                    cardImage: "url('/pictures/" + plansza[i][j] +".png')",
                });
            }
        } 
   }

    socket.on("rotate_card", ({ cardImage, rotation }) => {
        console.log(`Otrzymano informację o obrocie karty ${cardImage} na ${180-rotation} stopni`); 
        currentRotation = 1 - currentRotation; 
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