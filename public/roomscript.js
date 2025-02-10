const playerList = document.querySelector("#playerList")
const leaveButton = document.querySelector("#leaveRoom")
const roomList = document.querySelector("#roomList")
const startButton = document.querySelector("#start")

const socket = io();

let players = new Map()
let n = window.location.pathname.match(/[0-9]+/)[0]

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

startButton.addEventListener("click", () => {
  socket.emit("start");
  window.location.href = "/game/" + n
});

socket.on("start", () => {
  window.location.href = "/game/" + n
})

socket.emit("joinRoom", n)