import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainContentComponent } from './components/main/main.component';
import { QMGRInfoComponent } from './components/qmgrinfo/qmgrinfo.component';
import { QListComponent } from './components/queuelist/queuelist.component';
import { CHListComponent } from './components/chlist/chlist.component';
import { AuthListComponent } from './components/authlist/authlist.component';
import { TopicListComponent } from './components/topiclist/topiclist.component';
import { SubListComponent } from './components/sublist/sublist.component';

const routes: Routes = [
  {
    path:  '',
    component:  MainContentComponent
  },
  {
    path:  'showQmgr/:id',
    component:  QMGRInfoComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path:  'showQueues/:id',
    component:  QListComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path:  'showChannels/:id',
    component:  CHListComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path:  'showAuthR/:id',
    component:  AuthListComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path:  'showTopics/:id',
    component:  TopicListComponent,
    runGuardsAndResolvers: 'always'
  },
  {
    path:  'showSubs/:id',
    component:  SubListComponent,
    runGuardsAndResolvers: 'always'
  }
//  { path: '404', component: NotfoundComponent },
//  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
