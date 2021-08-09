import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from './material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, DialogContentQMDialogComponent} from './app.component';
import { MainContentComponent } from './components/main/main.component';
import { QMGRInfoComponent } from './components/qmgrinfo/qmgrinfo.component';
import { QListComponent, DialogDataQIDialogComponent } from './components/queuelist/queuelist.component';
import { CHListComponent } from './components/chlist/chlist.component';
import { AuthListComponent } from './components/authlist/authlist.component';
import { TopicListComponent } from './components/topiclist/topiclist.component';
import { SubListComponent } from './components/sublist/sublist.component';
import { MenuListItemComponent } from './components/menu-list-item/menu-list-item.component';
import { NavService } from './components/menu-list-item/nav.service';
import { DataService } from './common/data.service';


@NgModule({
  declarations: [
    AppComponent,
    MainContentComponent,
    MenuListItemComponent,
    DialogContentQMDialogComponent,
    DialogDataQIDialogComponent,
    QMGRInfoComponent,
    QListComponent,
    CHListComponent,
    AuthListComponent,
    TopicListComponent,
    SubListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  exports: [
    MatDialogModule
  ],
  providers: [NavService, DataService],
  entryComponents: [ DialogContentQMDialogComponent, DialogDataQIDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
