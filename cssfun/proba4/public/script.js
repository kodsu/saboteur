// Plik np. public/js/app.js

const socket = io();
let selectedCard = {
    element: null,
    url: null,
    rotation: 0,
    originalParent: null
};

document.addEventListener("DOMContentLoaded", function () {
    // Inicjujemy przyciski pól planszy
    const gridButtons = document.querySelectorAll(".grid button");
    gridButtons.forEach((btn, index) => {
        btn.id = `field-${index}`;
        btn.addEventListener("click", function() {
            if (selectedCard.element) placeCard(btn.id);
        });
    });

    const smallButtons = document.querySelectorAll(".small-buttons");
    smallButtons.forEach((btn, index) => {
        const pickaxe = btn.querySelector('.pickaxe');
        const lantern = btn.querySelector('.lantern');
        const cart = btn.querySelector('.cart');
        pickaxe.addEventListener("click", function() {
            if (selectedCard.element) placeCard(`field-${3*btn.id + 101}`);
        });
        lantern.addEventListener("click", function() {
            if (selectedCard.element) placeCard(`field-${3*btn.id + 102}`);
        });
        cart.addEventListener("click", function() {
            if (selectedCard.element) placeCard(`field-${3*btn.id + 103}`);
        });
    });

    // Nasłuchujemy kliknięć na karty w dolnym obszarze
    document.querySelectorAll(".bottom-cards .card").forEach(card => {
        card.addEventListener("click", function() {
            selectCard(card);
        });
    });

    socket.on("update_gold", ({gold}) => document.querySelector(".gold-info").innerHTML = gold);
});


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
})

function selectCard(cardElem) {
    // Reset poprzedniego wyboru
    if (selectedCard.element) {
        selectedCard.element.classList.remove('selected');
    }

    selectedCard.element = cardElem;
    selectedCard.url = getCleanBackgroundUrl(cardElem);
    selectedCard.rotation = 0;
    selectedCard.originalParent = cardElem.parentNode;

    // Wizualne zaznaczenie
    cardElem.classList.add('selected');
    
    // Aktualizacja podglądu – upewnij się, że w HTML masz elementy z klasami .preview-container i .preview-card
    const previewContainer = document.querySelector('.preview-container');
    const previewCard = previewContainer.querySelector('.preview-card');
    previewCard.style.backgroundImage = `url('${selectedCard.url}')`;
    previewCard.style.transform = 'rotate(0deg)';
    previewContainer.style.display = 'flex';
    
    // Aktywacja przycisku rotacji (przycisk musi mieć id="rotate-btn-main")
    document.getElementById('rotate-btn-main').disabled = false;
}

function rotateCard() {
    socket.emit("rotate_card", {
        cardImage: selectedCard.url,
        rotation: selectedCard.rotation
    });
    
    if (!selectedCard.element) print("Selection error\n");
    
    // Przełączamy rotację: 0 <-> 180 stopni
    selectedCard.rotation = selectedCard.rotation === 0 ? 180 : 0;
    
    // Aktualizujemy podgląd
    const previewCard = document.querySelector('.preview-card');
    previewCard.style.transform = `rotate(${selectedCard.rotation}deg)`;
    
    // Informujemy serwer, że nastąpił obrót karty
}

function placeCard(fieldId) {
    if (!selectedCard.element) return;

    // Wysyłamy do serwera informacje o umieszczeniu karty
    socket.emit("place_card", {
        fieldId: fieldId,
        cardImage: selectedCard.url,
        rotation: selectedCard.rotation
    });

    // Usuwamy kartę z ręki
    selectedCard.element.remove();
    
    // Ukrywamy podgląd i resetujemy stan
    document.querySelector('.preview-container').style.display = 'none';
    selectedCard = {
        element: null,
        url: null,
        rotation: 0,
        originalParent: null
    };
    document.getElementById('rotate-btn-main').disabled = true;
}

function getCleanBackgroundUrl(element) {
    return window.getComputedStyle(element)
        .backgroundImage
        .replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
}

// Aktualizacja planszy – przyjmujemy stan planszy z serwera
socket.on("update_board", (boardState) => {
    for (const [fieldId, data] of Object.entries(boardState)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        
        // Ustawiamy obrót pola i dodajemy obraz karty (jeśli chcesz, aby widoczny był również obraz)
        field.style.transform = `rotate(${data.rotation}deg)`;
        field.style.backgroundImage = `url('${data.cardImage}')`;
    }
});


socket.on("update_board", (boardState) => {
    for (const [fieldId, data] of Object.entries(boardState)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        
        // Ustawiamy obrót pola i dodajemy obraz karty (jeśli chcesz, aby widoczny był również obraz)
        field.style.transform = `rotate(${data.rotation}deg)`;
        field.style.backgroundImage = `url('${data.cardImage}')`;
    }
});



// robienie kolorów obramówek graczy. 
socket.on("update_border", ({ playerId, isGreen }) => {
    console.log(`Zmiana obramowania dla gracza ${playerId}, zielone: ${isGreen}`);
    
    const columns = document.querySelectorAll('.circle-buttons');
    
    let columnIndex, playerIndex;
    if (playerId <= 5) {
        columnIndex = 0; // Pierwsza kolumna (gracze 1-5)
        playerIndex = playerId - 1;
    } else {
        columnIndex = 1; // Druga kolumna (gracze 6-10)
        playerIndex = playerId - 6;
    }
    
    const players = columns[columnIndex].querySelectorAll('.player');
    
    if (players && players.length > playerIndex) {
        const playerButton = players[playerIndex].querySelector('.big-button');
        if (playerButton) {
            playerButton.style.borderColor = isGreen ? "green" : "yellow";
        }
    }
})

socket.on("update_cards_left", ({ playerId, number }) => {
    console.log(`Aktualizacja kart dla gracza ${playerId}, nowa liczba: ${number}`);
    
    const columns = document.querySelectorAll('.circle-buttons');
    
    let columnIndex, playerIndex;
    if (playerId <= 5) {
        columnIndex = 0;
        playerIndex = playerId - 1;
    } else {
        columnIndex = 1;
        playerIndex = playerId - 6;
    }
    
    const players = columns[columnIndex].querySelectorAll('.small-buttons');
    
    if (players && players.length > playerIndex) {
        const cardCountElement = players[playerIndex].querySelector('.card-count');
        if (cardCountElement) {
            cardCountElement.textContent = number;
            // Dodaj animację dla lepszej widoczności zmian
            cardCountElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cardCountElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
}); 


socket.on("set_card", ({ fieldId, cardImage }) => {
    console.log(`set_card: Karta ${cardImage} umieszczona na ${fieldId}`);
    querySelector(".grid").children[fieldId].style.backgroundImage = cardImage;
    io.emit("update_board", boardState); 
});

socket.on("update_blocks", ({ playerId, mask }) => {
    console.log(`Aktualizacja blokad dla gracza ${playerId}, nowa maska: ${mask}`);
    
    const columns = document.querySelectorAll('.circle-buttons');
    
    let columnIndex, playerIndex;
    if (playerId <= 5) {
        columnIndex = 0;
        playerIndex = playerId - 1;
    } else {
        columnIndex = 1;
        playerIndex = playerId - 6;
    }
    
    const players = columns[columnIndex].querySelectorAll('.small-buttons');
    
    if (players && players.length > playerIndex) { 
        console.log("ustawianie blokad", players, playerIndex); 
        const pickaxe = players[playerIndex].querySelector('.pickaxe');
        const lantern = players[playerIndex].querySelector('.lantern');
        const cart = players[playerIndex].querySelector('.cart');
        if (pickaxe && (mask & 1)) {
            pickaxe.style.backgroundImage = "url(wagon.png)";
            // Dodaj animację dla lepszej widoczności zmian
            pickaxe.style.transform = 'scale(1.2)';
            setTimeout(() => {
                pickaxe.style.transform = 'scale(1)';
            }, 200);
        }
        if (lantern && (mask & 2)) {
            lantern.style.backgroundImage = "url(wagon.png)";
            // Dodaj animację dla lepszej widoczności zmian
            lantern.style.transform = 'scale(1.2)';
            setTimeout(() => {
                lantern.style.transform = 'scale(1)';
            }, 200);
        }
        if (cart && (mask & 4)) {
            cart.style.backgroundImage = "url(wagon.png)";
            // Dodaj animację dla lepszej widoczności zmian
            cart.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cart.style.transform = 'scale(1)';
            }, 200);
        }
    }
}); 

//(Opcjonalnie) jeśli chcesz, by serwer rozsyłał potwierdzenie obrotu, możesz dodać listener:
socket.on("card_rotated", ({ cardImage, rotation }) => {
    const previewCard = document.querySelector('.preview-card');
    previewCard.style.transform = `rotate(${rotation}deg)`;
});
