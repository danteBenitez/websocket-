const socket = io("/");

const form = document.querySelector("form");
const input = form.querySelector("input");
const messages = document.querySelector("#messages");
const typingText = document.querySelector("#typing");

let username = "";

input.addEventListener("keydown", () => {
    socket.emit("typing", username);
});
input.addEventListener("keyup", () => {
    socket.emit("quit typing", username);
})

socket.on("typing", (author) => {
    console.log(`${author} comenzó a escribir...`);
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

Swal.fire({
  title: "Ingrese su nombre de usuario",
  html: `
        <input type="text" id="username" /> 
    `,
  confirmButtonText: "Enviar",
}).then(() => {
  const usernameInput = document.querySelector("#username");
  username = usernameInput.value;
  socket.emit("join");
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
    .map(
      (msg) =>
        `
        <li class="${msg.author == username ? "self" : ""}">
            <span class="author">
               ${msg.author}  
            </span>
            ${msg.message}
        </li> 
        `
    )
    .join("");
}

socket.on("all messages", (messageList) => {
  renderAllMessages(messageList);
  console.log(messageList);
});

console.log(socket.on);

socket.on("message", (data) => addMessage(data, false));

function addMessage(data, self) {
  messages.innerHTML += `
        <li class="${self ? "self" : ""}">
            <span class="author">
               ${data.author}  
            </span>
            ${data.message}
        </li> 
    `;
}
