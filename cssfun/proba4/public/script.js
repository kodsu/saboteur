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

    // Nasłuchujemy kliknięć na karty w dolnym obszarze
    document.querySelectorAll(".bottom-cards .card").forEach(card => {
        card.addEventListener("click", function() {
            selectCard(card);
        });
    });
});

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

//(Opcjonalnie) jeśli chcesz, by serwer rozsyłał potwierdzenie obrotu, możesz dodać listener:
socket.on("card_rotated", ({ cardImage, rotation }) => {
    const previewCard = document.querySelector('.preview-card');
    previewCard.style.transform = `rotate(${rotation}deg)`;
});
