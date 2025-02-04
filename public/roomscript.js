const playerList = document.querySelector("#playerList")

const socket = io();

socket.on("newPlayer", (name) => {
  console.log("join")
  const newElem = document.createElement("div");
  newElem.id = `Player${name}`
  newElem.innerHTML = `<br><label>${name}:</label></button>`
  playerList.appendChild(newElem);
});

socket.on("delPlayer", (name) => {
  document.querySelector(`#Player${name}`).remove()
});

socket.emit("joinRoom", window.location.pathname.match(/[0-9]+/)[0])