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

io.on("connection", (socket) => {
    console.log("Użytkownik połączony:", socket.id);

    // Wysyłamy aktualny stan planszy nowemu klientowi
    socket.emit("update_board", boardState);

    // Obsługa umieszczania karty na planszy
    socket.on("place_card", ({ fieldId, cardImage, rotation }) => {
        console.log(`Karta ${cardImage} umieszczona na ${fieldId}, rotacja: ${rotation}`);

        // Aktualizacja stanu planszy
        boardState[fieldId] = { cardImage, rotation };

        // Rozsyłamy nowy stan planszy do wszystkich klientów
        io.emit("update_board", boardState);
    });

    // Obsługa rotacji karty (przed umieszczeniem)
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
