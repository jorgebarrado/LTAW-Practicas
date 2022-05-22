//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const msg_nick = document.getElementById("nick");

//-- Variable del nickname
let nickname = 'Desconocido';

//-- Variable que muestra si se escribe
let user_write = false;

//-- Cargar sonido
let silbido = new Audio('silbido.mp3');

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();


//-- Evento message
socket.on("message", (msg)=>{
  display.innerHTML += '<p style="color:black">' + msg + '</p>';
  if(!msg.includes('esta escribiendo...')){
    //-- Sonar cuando el mensaje sea distinto a estar escribiendo
    silbido.play();
  }
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
  //-- Si hay valor en la caja, enviar el valor
  if (msg_entry.value){
    socket.send(nickname + ': ' + msg_entry.value);
    user_write = false;
  }
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}

//-- Al estar escribiendo se les manda un mensaje a los usuarios
msg_entry.oninput = () => {
  //-- Si esta escribiendo
  if(!user_write){
    user_write = true;
    socket.send('El usuario ' + nickname + ' esta escribiendo...');
  };
};

console.log(nickname)

//-- Al introducir el botón del nick se le asigna
msg_nick.onchange = () => {
  if(msg_nick.value){
    nickname = msg_nick.value;
  }
  console.log(nickname);
}