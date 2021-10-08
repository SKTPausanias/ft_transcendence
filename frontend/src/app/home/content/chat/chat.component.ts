import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('searchText') search: ElementRef<HTMLInputElement>;
  users: any;
  session = this.sQuery.getSessionToken();
  constructor(
    private chatService: ChatService,
    private sQuery: SessionStorageQueryService
    ) { }

  ngOnInit(): void {
  }

  async onSubmitFriends(val: any): Promise<void> {
    console.log("text value:", this.search.nativeElement.value);
    this.users = await this.chatService.getPeople(this.session, this.search.nativeElement.value);
    console.log(this.users);
  }
}
