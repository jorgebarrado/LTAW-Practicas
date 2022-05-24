//-- Es el proceso de renderizado

const electron = require('electron');
const qrcode = require('qrcode');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const v_node = document.getElementById("info1");
const v_chrome = document.getElementById("info2");
const v_electron = document.getElementById("info3");
const archi = document.getElementById("info4");
const plataf = document.getElementById("info5");
const direct = document.getElementById("info6");
const num_usuarios = document.getElementById("users");
const dir_ip = document.getElementById("ip");
const code = document.getElementById("qrcode");
const boton = document.getElementById("btn_test");
const mensajes = document.getElementById("display");


//------ Mensajes recibidos del proceso MAIN ------

//-- Información del sistema
electron.ipcRenderer.on('informacion', (event, message) => {
    console.log("Recibido: " + message);

    //-- Extraemos cada dato
    v_node.textContent = message[0];
    v_chrome.textContent = message[1];
    v_electron.textContent = message[2];
    archi.textContent = message[3];
    plataf.textContent = message[4];
    direct.textContent = message[5]
    url = ("http://" + message[6] + ":" + message[7] + "/" + message[8]);
    dir_ip.textContent = url;

    //-- Generar el codigo qr de la url
    qrcode.toDataURL(url, function (err, url) {
        code.src = url;
    });

});

//-- Numero de usuarios
electron.ipcRenderer.on('users', (event, message) => {
    console.log("Recibido: " + message);
    num_usuarios.textContent = message;
});

//-- Mensajes de los clientes
electron.ipcRenderer.on('msg_client', (event, message) => {
    console.log("Recibido: " + message);
    mensajes.innerHTML += message + "<br>";
});

//------ Mensajes enviados al proceso MAIN ------
boton.onclick = () => {
    console.log("Botón apretado!");

    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', ">>> ESTAIS SIENDO OBSERVADOS POR UNA APP");
};  