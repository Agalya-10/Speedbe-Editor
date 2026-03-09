import { Component, EventEmitter, Output } from '@angular/core';
import { MyServiceService } from 'src/app/my-service.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() wordMode = new EventEmitter<boolean>();

  isCollapsed = false;
  Collapsed = false;
  zoomout = false;
  isCollapse = false;
  Toolbar = "none";
  Insertshow = true;
  paginateshow = true;
  floatbutton = true;
  word = true
  line = false
  para = false
  list = false
  float = false


  constructor(private service: MyServiceService) { }
  ngOnInit() { }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  singleSidebar() {
    this.Collapsed = !this.Collapsed;
  }
  zoomSidebar() {
    this.zoomout = !this.zoomout;
  }
  wordclick() {
    this.Toolbar = "word";
    this.service.sendValueFromToolbar(this.Toolbar);
    this.service.enableWordSelection = true;
    this.service.enableLineSelection = false;
    this.service.setLineMode(false);
  }
  lineclick() {
    this.Toolbar = "line";
    this.service.sendValueFromToolbar(this.Toolbar);
    this.service.enableWordSelection = true;
    this.service.enableLineSelection = true;
    this.service.setLineMode(true);
  }
  paraclick() {
    this.Toolbar = "para";
    this.service.sendValueFromToolbar(this.Toolbar);
    this.service.setLineMode(false);
    this.service.setParaMode(true);
  }
  listclick() {
    this.Toolbar = "list";
    this.service.sendValueFromToolbar(this.Toolbar);
    this.service.setListMode(true);
    this.service.setParaMode(false);
  }
  floatButton() {
    // this.Toolbar = "float";
    this.service.sendValueFromFloatmenu(this.floatbutton);
    this.service.setListMode(false);
    this.service.setLineMode(false);
    this.service.setParaMode(false);
    this.service.enableWordSelection = false;

  }
  insertIcon() {
    this.service.sendValueFromInsertmenu(this.Insertshow)
  }
  Paginate() {
    this.service.sendValueFromPaginatemenu(this.paginateshow)

  }
  click(event: string) {
    this.word = false;
    this.para = false;
    this.line = false;
    this.list = false;
    // this.float=false;

    switch (event) {
      case 'word':
        this.word = true;
        break;
      case 'para':
        this.para = true;
        break;
      case 'line':
        this.line = true;
        break;
      case 'list':
        this.list = true;
        break;
      // case 'float':
      // this.float = true;
      // break;
    }
  }

}
