import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterRoutingModule } from './master-routing.module';
import { MasterComponent } from './master.component';
// import { AppComponent } from 'src/app/app.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { HeadersComponent } from '../headers/headers.component';
import { SidepanelComponent } from '../sidepanel/sidepanel.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    MasterComponent,
    ToolbarComponent,
    HeadersComponent,
    SidepanelComponent
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    FormsModule
  ]
})
export class MasterModule { }
