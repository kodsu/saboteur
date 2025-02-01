const playerList = document.querySelector("#playerList")

const socket = io();

socket.on("newPlayer", (name) => {
  const newElem = document.createElement("div");
  newElem.id = `Player${name}`
  newElem.innerHTML = `<br><label>${name}:</label></button>`
  roomList.appendChild(newElem);
});

socket.on("delPlayer", (name) => {
  document.querySelector(`Player${name}`).remove()
});

socket.on("joinRoom", (n) => {
  console.log('???')
  socket.emit("joinRoom", n)
});