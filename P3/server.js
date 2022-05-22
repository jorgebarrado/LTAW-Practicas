//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');


const PUERTO = 9090;

//-- Creamos la variable de numero de usuarios conectados
let num_user = 0;

//-- Creamos el objeto fecha
const tiempo = Date.now();
const fecha = new Date(tiempo);


//-- Establecemos los mensajes a mostrar en el chat
//-- Para el recurso '/help'
let help_msg = ("Los comandos soportados son los siguientes:<br>" +
                ">>> <b>'/help'</b>: Mostrar los comandos soportados<br>" +
                ">>> <b>'/list'</b>: Mostrar numero de usuarios conectados<br>" +
                ">>> <b>'/hello'</b>: El servidor te saluda<br>" +
                ">>> <b>'/date'</b>: Mostrar la fecha actual<br>");

//-- Para el recurso '/list'
let list_msg = ("Número de usuarios conectados: ");

//-- Para el recurso '/hello'
let hello_msg = ("¡HOLA! Gracias por unirte al chat, espero que disfrutes");

//-- Para el recurso '/date'
let date_msg = ("Fecha actual: <b>" + fecha.toUTCString()+ "</b>");
                    
//-- Para un recurso distinto
let error_msg = ("Comando no reconocido");

//-- Mensaje de Bienvenida
let bienv_msg = ('>>> ¡Bienvenido al chat!');

//-- Mensaje de nueva conexión
let conec_msg = ('>>> Nuevo usuario conectado');

//-- Mensaje fin conexión
let desc_msg = ('>>> Un usuario ha abandonado el chat');

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  path = __dirname + '/public/index.html';
  res.sendFile(path);
  console.log("Solicitado acceso al chat");
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//-- Comprobar los comandos especiales
function check_command(msg){
  let data;
  if(msg == '/help'){
    console.log('>>> Mostrar Comandos soportados');
    data = help_msg;
  }else if(msg == '/list'){
    console.log('>>> Numero de usuarios conectados');
    data = list_msg + num_user;
  }else if(msg == '/hello'){
    console.log('>>> Servidor  devuelve el saludo');
    data = hello_msg;
  }else if(msg == '/date'){
    console.log('>>> Mostrar la fecha');
    data = date_msg;
  }else{
    console.log('>>> Comando no reconocido');
    data = error_msg;
  };
  return(data);
};

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  //-- Incrementamos el numero de usuarios conectados
  num_user += 1;

  //-- Enviar mensaje de bienvenida al usuario
  socket.send(bienv_msg);

  //-- Enviar mensaje de nuevo usuario a todos los usuarios
  io.send(conec_msg);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    //-- Decrementamos el numero de usuarios conectados
    num_user -= 1;
    //-- Enviar mensaje de desconexión de usuario a todos los usuarios
    io.send(desc_msg);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);
    //-- Descarto el nombre de usuario
    msg_text = msg.split(' ')[1];
    //-- Comprobar si el mensaje es un recurso
    if(msg_text.startsWith('/')){
      console.log("Recurso recibido!: " + msg_text.red);
      //-- Comprobamos el recurso solicitado
      data = check_command(msg_text);
      socket.send(data);
    }else{
      //-- Reenviarlo a todos los clientes conectados
      io.send(msg);
    }
  });
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);