const socket = io("/");

const form = document.querySelector("form");
const input = form.querySelector("input");
const messages = document.querySelector("#messages");
const typingText = document.querySelector("#typing");
const changeName = document.querySelector("#change-username");
const user = document.querySelector(".user");

let username = "Usuario desconocido";

let timer = null;
input.addEventListener("keydown", () => {
  socket.emit("typing", username);
  clearTimeout(timer);
  timer = setTimeout(() => {
    socket.emit("quit typing", username);
  }, 500);
});

socket.emit("join");

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
    });
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
    behavior: 'smooth',
    top: messages.scrollHeight
  })
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
