import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from 'src/app/models/mensaje';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  usuario1='';
  usuario2='';
  
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
      return new SockJS("https://app-chat-ws.herokuapp.com/ws-chat");
    };
    this.client.onConnect = (frame) => {
      console.log('Conectados: ' + this.client.connected + ' : ' + frame);

      this.client.subscribe(`/chat/mensaje/${this.mensaje.username1}${this.mensaje.username2}`, e => {
        
        let nuevoMensaje: Mensaje = JSON.parse(e.body);
        this.mensajes.push(nuevoMensaje);
        setTimeout(()=>{
          this.scrollear.scrollTop=this.scrollear.scrollHeight;
        },10)
      })

      this.client.subscribe('/chat/historial', e => {

        
        
        this.mensajes=JSON.parse(e.body) as Mensaje[];
        this.scrollear=document.getElementById('message');
        setTimeout(()=>{
          this.scrollear.scrollTop=this.scrollear.scrollHeight;
        },10)
        

      })
      this.client.subscribe(`/chat/escribiendo/${this.mensaje.username2}${this.mensaje.username1}`,e=>{
        
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
this.mensaje.username1=this.usuario1.toLowerCase();
this.mensaje.username2=this.usuario2.toLowerCase();
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
  ingreso(form:NgForm){
    if(form.invalid || form.controls.usuario1.value.toLowerCase() == form.controls.usuario2.value.toLowerCase()){
      form.control.markAllAsTouched();
      return;
    }
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
