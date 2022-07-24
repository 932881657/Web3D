import { Component, Input, OnInit } from '@angular/core';
import { PlayerService } from '../services/player.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  text: string = "";
  others: any[] = [];
  messages: any[] = [];
  @Input() mapId!: string;

  constructor(private playerService: PlayerService) { }

  ngOnInit(): void {
    this.playerService.onMyJoin().subscribe((resp: any) => {
      this.others = resp.others;
    });
    this.playerService.onOthersSpeak().subscribe((resp: any) => {
      this.pushMessage({
        isMe: false,
        content: resp.message,
        username: resp.username,
        modelName: resp.modelName
      });
    });
    this.playerService.onOthersJoin().subscribe((resp: any) => {
      this.others.push(resp);
    });
    this.playerService.onOthersQuit().subscribe((resp: any) => {
      this.others = this.others.filter(value=>{
        return value.id !== resp;
      })
    });
  }

  speak(): void {
    this.pushMessage({
      isMe: true,
      content: this.text,
      username: localStorage.getItem('username'),
      modelName: localStorage.getItem('modelName')
    });
    this.playerService.mySpeak(this.text);
    this.text = '';
  }

  pushMessage(message: any): void {
    if (this.messages.length === 8) {
      this.messages.shift();
    }
    this.messages.push(message);
  }
}
