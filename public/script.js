const newRoomButton = document.querySelector("#newRoomButton");
const roomList = document.querySelector("#roomList")

const socket = io();

newRoomButton.addEventListener("click", () => {
  socket.emit("newRoom");
});

let button_list = document.querySelectorAll(".joinButton")
for(let i = 0; i < button_list.length; i++) {
  let button = button_list[i]
  console.log(button)
  button.addEventListener("click", () => {
    window.location.href = "/room/" + button.id.match(/[0-9]+/)[0]
  });
}

socket.on("setRoom", (n) => {
  window.location.href = "/room/" + n
});

socket.on("newRoom", (n) => {
  const newElem = document.createElement("div");
  newElem.id = `Room${n}`
  newElem.innerHTML = `<br><label>Pokój ${n}:</label> <button id="room${n}Button" class="joinButton">Dołącz</button>`
  roomList.appendChild(newElem);
  document.querySelector(`#room${n}Button`).addEventListener("click", () => {
    window.location.href = "/room/" + n;
  });
})

socket.on("delRoom", (n) => {
  document.querySelector(`#Room${n}`).remove()
});