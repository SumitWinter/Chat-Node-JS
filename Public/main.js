const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
let userName = "";
const sendNotification = (user) => {
  this.sound = new Audio();
  this.sound.src = 'images/sound.mp3';
  this.sound.load();
  const promise = this.sound.play();
  if (promise !== undefined) { // On older browsers play() does not return anything, so the value would be undefined.
    promise
      .then(() => {
        // Audio is playing.
      })
      .catch(error => {
        console.log(error);
      });
  }
};

const newUserConnected = (user) => {
  userName = user || `User-${Math.floor(Math.random() * 1000000)}`;
  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <p class="user_id">${userName}</p>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `

  <div class="bubbleWrapper">
        <div class="inlineContainer">
            <div class="otherBubble other">
              <p class = "Message_imp">${message}</p>
            </div>
        </div>
      <span class="other">${user}</span>
        <span class="other">${formattedTime}</span>
  </div>`;

  const myMsg = `

  <div class="bubbleWrapper">
    <div class="inlineContainer own">
      <div class="ownBubble own">
        <p class = "Message_imp">${message}</p>
      </div>
    </div>
    <span class="own">${formattedTime}</span>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
  var objDiv = document.getElementById("inbox__messages");
  objDiv.scrollTop = objDiv.scrollHeight;
};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

messageForm.addEventListener("submit", (e) => {

  socket.emit("sent", {
    nick: userName,
  });

});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });
});

socket.on("new user", function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${nick} is typing...</p>`;
});

socket.on("sent", function (data) {
  sendNotification();
});z