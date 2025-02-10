const playerList = document.querySelector("#playerList")
const leaveButton = document.querySelector("#leaveRoom")

const socket = io();

let players = new Map()

socket.on("newPlayer", (name) => {
  console.log("join")
  const newElem = document.createElement("div");
  newElem.id = `Player${name}`
  newElem.innerHTML = `<br><label>${name}</label></button>`
  playerList.appendChild(newElem);
  players[name] = newElem;
});

socket.on("delPlayer", (name) => {
  console.log("del")
  players[name].remove()
});

leaveButton.addEventListener("click", () => {
  socket.emit("leaveRoom");
  window.location.href = "/"
});

socket.emit("joinRoom", window.location.pathname.match(/[0-9]+/)[0])