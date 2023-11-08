const socket = io("/");

const form = document.querySelector("form");
const input = form.querySelector("input");
const messages = document.querySelector("#messages");
const typingText = document.querySelector("#typing");
const changeName = document.querySelector("#change-username");
const user = document.querySelector(".user");
const rooms = document.querySelector("#rooms");

let username = "Usuario desconocido";

document.addEventListener("DOMContentLoaded", () => {
  socket.emit("get available rooms");
});

let timer = null;
input.addEventListener("keydown", () => {
  socket.emit("typing", username, currentRoomId);
  clearTimeout(timer);
  timer = setTimeout(() => {
    socket.emit("quit typing", username, currentRoomId);
  }, 500);
});

let currentRoomId = 0;

socket.emit("join", 0);

socket.on("typing", (author) => {
  typingText.innerHTML = `
        <p>
            ${author} está escribiendo.
        </p>
    `;
});

socket.on("quit typing", (author) => {
  if (typingText.textContent.includes(author)) {
    typingText.innerHTML = "";
  }
});

changeName.addEventListener("click", () => {
  Swal.fire({
    title: "Ingrese su nombre de usuario",
    html: `
          <input type="text" id="username" placeholder="test-name" class="form-control" /> 
      `,
    confirmButtonText: "Enviar",
  }).then(() => {
    const usernameInput = document.querySelector("#username");
    username = usernameInput.value.length != 0 ? usernameInput.value : username;
    user.querySelector("p").textContent = username;
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.length) {
    socket.emit("message", {
      message: input.value,
      author: username,
    }, currentRoomId);
    addMessage(
      {
        author: username,
        message: input.value,
      },
      true
    );
    input.value = "";
  }
});

function renderAllMessages(messageList) {
  messages.innerHTML = messageList
    .map((msg) => renderMessage(msg, msg.author == username))
    .join("");
}

socket.on("all messages", (messageList) => {
  renderAllMessages(messageList);
  console.log(messageList);
});

socket.on("message", (data) => addMessage(data, false));

function addMessage(data, self) {
  messages.innerHTML += renderMessage(data, self);
  messages.scrollBy({
    behavior: "smooth",
    top: messages.scrollHeight,
  });
}

function renderMessage(data, self) {
  return `
        <li class="${self ? "self" : ""} shadow-sm">
            <span class="author">
               ${data.author}  
            </span>
            ${data.message}
        </li> 
  `;
}

function setRoomId(roomId) {
  // Dejar la sala actual
  socket.emit("leave", currentRoomId);
  currentRoomId = roomId;
  // Unirse a la sala establecida
  socket.emit("join", currentRoomId);

  // Actualizar las salas disponibles
  socket.emit("get available rooms");
}

function renderAvailableRooms(rooms) {
  return rooms
    .map(
      (room) => `
  <div class="list-group list-group-flush border-bottom scrollarea">
  <a href="#" class="list-group-item list-group-item-action ${
    currentRoomId == room.id ? "active" : ""
  } py-3 lh-sm" 
     onclick="setRoomId(${room.id})"
     aria-current="true">
    <div class="d-flex w-100 align-items-center justify-content-between">
      <strong class="mb-1">${room.name}</strong>
    </div>
  </a>
</div> 
  `
    )
    .join("");
}

socket.on("available rooms", (roomData) => {
  rooms.innerHTML = renderAvailableRooms(roomData);
});
