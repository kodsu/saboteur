// Zmodyfikowany kod JavaScript

        const socket = io();
        let selectedCard = {
            element: null,
            url: null,
            rotation: 0,
            originalParent: null
        };

        document.addEventListener("DOMContentLoaded", function () {
            const gridButtons = document.querySelectorAll(".grid button");
            gridButtons.forEach((btn, index) => {
                btn.id = `field-${index}`;
                btn.addEventListener("click", function() {
                    if (selectedCard.element) placeCard(btn.id);
                });
            });

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

            // Aktualizacja stanu
            selectedCard.element = cardElem;
            selectedCard.url = getCleanBackgroundUrl(cardElem);
            selectedCard.rotation = 0;
            selectedCard.originalParent = cardElem.parentNode;

            // Wizualne zaznaczenie
            cardElem.classList.add('selected');
            
            // Aktualizacja podglądu
            const previewContainer = document.querySelector('.preview-container');
            const previewCard = previewContainer.querySelector('.preview-card');
            previewCard.style.backgroundImage = `url('${selectedCard.url}')`;
            previewCard.style.transform = 'rotate(0deg)';
            previewContainer.style.display = 'flex';
            
            // Aktywacja przycisku
            document.getElementById('rotate-btn').disabled = false;
        }

        function rotateCard() {
            if (!selectedCard.element) return;
            
            selectedCard.rotation = (selectedCard.rotation + 1) % 2;
            const previewCard = document.querySelector('.preview-card');
            previewCard.style.transform = `rotate(${selectedCard.rotation * 180}deg)`;
        }

        function placeCard(fieldId) {
            if (!selectedCard.element) return;

            // Wysłanie danych do serwera
            socket.emit("place_card", {
                fieldId: fieldId,
                cardImage: selectedCard.url,
                rotation: selectedCard.rotation
            });

            // Usunięcie karty z ręki
            selectedCard.element.remove();
            
            // Reset stanu
            document.querySelector('.preview-container').style.display = 'none';
            selectedCard = {
                element: null,
                url: null,
                rotation: 0,
                originalParent: null
            };
            document.getElementById('rotate-btn').disabled = true;
        }

        function getCleanBackgroundUrl(element) {
            return window.getComputedStyle(element)
                .backgroundImage
                .replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
        }

        // Obsługa aktualizacji planszy
        socket.on("update_board", (boardState) => {
            for (const [fieldId, data] of Object.entries(boardState)) {
                const field = document.getElementById(fieldId);
                if (!field) continue;
                
                field.style.backgroundImage = `url('${data.cardImage}')`;
                field.style.transform = `rotate(${data.rotation * 180}deg)`;
            }
        });