const express = require('express')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Konfiguracja ścieżek
app.use(express.static(path.join(__dirname, 'public')))
app.use('/pictures', express.static(path.join(__dirname, 'public', 'pictures')))

// Stan planszy (początkowo pusty)
let boardState = {};

// Obsługa połączeń WebSocket
io.on("connection", (socket) => {
    console.log("Użytkownik połączony:", socket.id);

    // Wysyłamy aktualny stan planszy nowemu graczowi
    socket.emit("update_board", boardState);

    // Obsługa umieszczania karty na planszy
    socket.on("place_card", ({ fieldId, cardImage, rotation }) => {
        console.log(`Karta ${cardImage} umieszczona na ${fieldId}, rotacja: ${rotation}`);

        // Aktualizacja planszy
        boardState[fieldId] = { cardImage, rotation };

        // Wysłanie nowego stanu do wszystkich klientów
        io.emit("update_board", boardState);
    });

    // Obsługa rozłączenia użytkownika
    socket.on("disconnect", () => {
        console.log("Użytkownik rozłączony:", socket.id);
    });
});

// Uruchomienie serwera
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
