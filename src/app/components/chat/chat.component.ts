import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { JsonPipe } from '@angular/common';
import { Mensaje } from 'src/app/models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  escribiendo=''

  ingresoUsuario=false;

  private client: Client;
  mensaje: Mensaje = new Mensaje();
  mensajes: Mensaje[] = [];

  scrollear:any;
  constructor() { }

  ngOnInit(): void {
    this.client = new Client();
    this.client.webSocketFactory = () => {
      return new SockJS("http://192.168.1.9:8080/ws-chat");
    };
    this.client.onConnect = (frame) => {
      console.log('Conectados: ' + this.client.connected + ' : ' + frame);

      this.client.subscribe(`/chat/mensaje/${this.mensaje.username1}${this.mensaje.username2}`, e => {
        console.log(e.body);
        let nuevoMensaje: Mensaje = JSON.parse(e.body);
        this.mensajes.push(nuevoMensaje);
        setTimeout(()=>{
          this.scrollear.scrollTop=this.scrollear.scrollHeight;
        },10)
      })


      this.client.subscribe('/chat/historial', e => {

        console.log(e.body);
        
        this.mensajes=JSON.parse(e.body) as Mensaje[];
        this.scrollear=document.getElementById('message');
        console.log(this.scrollear.scrollHeight);
        setTimeout(()=>{
          this.scrollear.scrollTop=this.scrollear.scrollHeight;
        },10)
        

      })
      this.client.subscribe(`/chat/escribiendo/${this.mensaje.username2}${this.mensaje.username1}`,e=>{
        console.log(e.body);
        this.escribiendo=e.body as string;
        setTimeout(() => {
          
          this.escribiendo='';

        }, 3500);
      })


      this.client.publish({

        destination: '/app/historial_usuario',
        body:this.mensaje.username1+'--;--'+this.mensaje.username2
      })



    }
    this.client.onDisconnect = (frame) => {
      console.log('Desconectados: ' + !this.client.connected + ' : ' + frame);
    }


  }
  conectar() {

    this.client.activate();
    
  }
  desconectar() {
    this.client.deactivate();
    this.mensajes=[];
    this.mensaje.texto=''
    this.ingresoUsuario=false;
  }
  enviarMensaje() {
    if(this.mensaje.texto==''){
      return;
    }
    
    this.client.publish({

      destination: '/app/mensaje',
      body: JSON.stringify(this.mensaje)

    })
    this.mensaje.texto='';
  }
  ingreso(){
    this.ingresoUsuario=true;
    this.conectar();
  }

  estaEscribiendo(){
    this.client.publish({
      destination:'/app/escribiendo',
      body:JSON.stringify(this.mensaje)
    })

  }

}
