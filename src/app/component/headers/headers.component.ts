import { Component } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { MyServiceService } from 'src/app/my-service.service';

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent {
  menu=false;
  constructor(private service:MyServiceService){}
  ngOnInit(){}

  info(){
        this.menu = !this.menu;
        this.service.sendValueFromHeader(this.menu)
  }
download(){
  this.service.downloadPDF();
}
  
}
