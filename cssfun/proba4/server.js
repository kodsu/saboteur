// Plik np. server.js

const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

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

// Lista dostępnych kart
const availableCards = [
    "E03.png", "E04.png", "E05.png", "E06.png", "E07.png", "E08.png"
];



io.on("connection", (socket) => {
    console.log("Użytkownik połączony:", socket.id);

    // socket.on("set_border", ({ playerId, isGreen }) => {
    //     console.log(`Zmiana obramowania dla gracza ${playerId}: ${isGreen ? "zielone" : "brak"}`);
        
    //     playerBorders[playerId] = isGreen;

    //     io.emit("update_border", { playerId, isGreen });
    // });

    let GameStarter = 9; 
    for(let i = 1; i <= 10; i++){ 
        socket.emit("update_border", {playerId: i, isGreen: 0});  
        socket.emit("update_cards_left", {playerId: i, number: i}); 
        socket.emit("update_blocks", {playerId: i, mask: i%8}); 
    }
    socket.emit("update_border", {playerId: GameStarter, isGreen: 1});  


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
    // Wysyłamy aktualny stan planszy nowemu klientowi
    socket.emit("update_board", boardState);

    // Obsługa umieszczania karty na planszy
    socket.on("place_card", ({ fieldId, cardImage, rotation }) => {
        console.log(`Karta ${cardImage} umieszczona na ${fieldId}, rotacja: ${rotation}`);
        boardState[fieldId] = { cardImage, rotation };
        let name = cardImage.slice(-7); 

        let index = userCards[socket.id].indexOf(name); 
        console.log(name, userCards[socket.id]);
        if(index !== -1){ 
            userCards[socket.id].splice(index, 1); 
        } 
        console.log(name, userCards[socket.id]); 
        io.emit("init_cards", { n: userCards[socket.id].length, cards: userCards[socket.id] });
        io.emit("update_board", boardState);
    });


   

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
