import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterComponent } from './master.component';
import { HeadersComponent } from '../headers/headers.component';
// import { ToolbarComponent } from '../toolbar/toolbar.component';
// import { SidepanelComponent } from '../sidepanel/sidepanel.component';

const routes: Routes = [
  { path: '', component: MasterComponent, 

    children:[
      {path:'',component:HeadersComponent},
      // {path:'toolbar',component:ToolbarComponent},
      // {path:'sidebar',component:SidepanelComponent}
    ]

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
