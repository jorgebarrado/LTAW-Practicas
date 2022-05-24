//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const electron = require('electron');
const ip = require('ip');
const process = require('process');

//-- Pueto donde tiene que escuchar el servidor 
const PUERTO = 9090;

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-- Creamos la variable de numero de usuarios conectados
let num_user = 0;

//-- Creamos el objeto fecha
const tiempo = Date.now();
const fecha = new Date(tiempo);

//-- Establecemos los mensajes a mostrar en el chat
//-- Para el recurso '/help'
let help_msg = ("Los comandos soportados son los siguientes:<br>" +
                "> <b>'/help'</b>: Mostrar los comandos soportados<br>" +
                "> <b>'/list'</b>: Mostrar numero de usuarios conectados<br>" +
                "> <b>'/hello'</b>: El servidor te saluda<br>" +
                "> <b>'/date'</b>: Mostrar la fecha actual<br>");

//-- Para el recurso '/list'
let list_msg = ("Número de usuarios conectados: ");

//-- Para el recurso '/hello'
let hello_msg = ("¡Hola, bienvenido al CHAT WEB!");

//-- Para el recurso '/date'
let date_msg = ("Fecha actual: <b>" + fecha.toUTCString()+ "</b>");
                    
//-- Para un recurso distinto
let error_msg = ("Comando no reconocido");

//-- Mensaje de Bienvenida
let bienv_msg = ('> ¡Bienvenido, te acabas de conectar al chat web!');

//-- Mensaje de nueva conexión
let conec_msg = ('> Se ha conectado un usuario');

//-- Mensaje fin conexión
let desc_msg = ('> Se ha conectado un usuario');

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
    console.log('> Mostrar Comandos soportados');
    data = help_msg;
  }else if(msg == '/list'){
    console.log('> Numero de usuarios conectados');
    data = list_msg + num_user;
  }else if(msg == '/hello'){
    console.log('> Servidor  devuelve el saludo');
    data = hello_msg;
  }else if(msg == '/date'){
    console.log('> Mostrar la fecha');
    data = date_msg;
  }else{
    console.log('> Comando no reconocido');
    data = error_msg;
  };
  return(data);
};

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('* NUEVA CONEXIÓN *'.yellow);
  //-- Incrementamos el numero de usuarios conectados
  num_user += 1;

  //-- Enviar mensaje de bienvenida al usuario
  socket.send(bienv_msg);

  //-- Enviar mensaje de nuevo usuario a todos los usuarios
  io.send(conec_msg);

  //-- Enviar al render mensaje de conexion
  win.webContents.send('msg_client', conec_msg);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('* CONEXIÓN FINALIZADA *'.yellow);
    //-- Decrementamos el numero de usuarios conectados
    num_user -= 1;
      
    //-- Enviar numero de usuarios al renderer
    win.webContents.send('users', num_user);

    //-- Enviar mensaje de desconexión de usuario a todos los usuarios
    io.send(desc_msg);

    //-- Enviar al render mensaje de desconexion
    win.webContents.send('msg_client', desc_msg);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Enviar al render
    win.webContents.send('msg_client', msg);

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

//------ Crear la app de electron ----
electron.app.on('ready', () => {
  console.log("Evento Ready!");

  //-- Crear la ventana principal de nuestra aplicación
  win = new electron.BrowserWindow({
      width: 1000,  //-- Anchura 
      height: 1000,  //-- Altura

      //-- Permitir que la ventana tenga ACCESO AL SISTEMA
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
    }

  });

  //-- Cargar interfaz gráfica en HTML
  let fichero = "index.html"
  win.loadFile(fichero);

  //-- Obtener informacion a enviar al renderizador
  //-- Obtener versiones
  v_node = process.versions.node;
  v_chrome = process.versions.chrome;
  v_electron = process.versions.electron;
  //-- Obtener arquitectura
  arch = process.arch;
  //-- Obtener plataforma
  platform = process.platform;
  //-- obtener directorio
  direct = process.cwd();
  //-- Obtener direccion IP
  dir_ip = ip.address();
  //-- Numero de usuario ya lo tenemos calculado
  //-- El puerto tambien

  //-- Reagrupar los datos a enviar
  let datos = [v_node, v_chrome, v_electron, arch, platform, direct,
              dir_ip, PUERTO, fichero];

  //-- Esperar a que la página se cargue  con el evento 'ready-to-show'
  win.on('ready-to-show', () => {
      console.log("Enviando datos...");
      //-- send(nombre evento, mensaje)
      win.webContents.send('informacion', datos);
  });

});

//----- Mensajes recibidos del renderizado --------

//-- Esperar a recibir los mensajes de botón apretado (Test)
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
  //-- Reenviarlo a todos los clientes conectados
  io.send(msg);
});