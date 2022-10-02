import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort } from '@angular/material/sort'; 
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-topiclist-component',
  templateUrl: './topiclist.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class TopicListComponent implements OnInit, OnDestroy {
  navigationSubscription;
  displayedTOPICColumns: string[] = [
    'topic',
    'topicstr',
    'descr',
    'pubscope',
    'subscope',
    'altdate',
    'alttime'
    ];
    dataSourceTOPIC = new MatTableDataSource();

  @ViewChild('TOPICSort', {static: true}) TOPICSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.topiclist = []; }
        this.getTOPICS();
      }
    });
   }

  ngOnInit() {
    if (this.dataServ.jsonkeychanged) { this.dataServ.topiclist = []; }
    this.getTOPICS();
  }
  getTOPICS() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;
//  this.dataServ.systemobj = thissysobj;
//  this.dataServ.emptyobj = thisemptyobj;

  if (!this.dataServ.topiclist || this.dataServ.topiclist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.topiclist = [];
//    this.dataServ.topiclistreply = [];
    const QMGRinput = {
      type: 'READ',
      hostname: this.dataServ.arrQMGRtemp.hostname,
      channel: this.dataServ.arrQMGRtemp.channel,
      port: this.dataServ.arrQMGRtemp.port,
      qmanager: this.dataServ.arrQMGRtemp.name,
      function: 'TOPICS',
      systemobj: this.dataServ.systemobj,
      ssl: this.dataServ.arrQMGRtemp.ssl,
      sslkey: this.dataServ.arrQMGRtemp.sslkey,
      sslpass: this.dataServ.arrQMGRtemp.sslpass,
      sslcipher: this.dataServ.arrQMGRtemp.sslcipher
    };
    let qmreply: any;
    try {
      qmreply = JSON.parse(window.electronIpcSendSync('execPCFQD', JSON.stringify(QMGRinput)));
      this.dataServ.dataerr = false;
    } catch (e) {
      qmreply = '';
      this.dataServ.dataerr = true;
    }
    if (qmreply.topics) {
  //  this.dataServ.topiclistreply = qmreply.topics;
    for ( const [key, value] of Object.entries( qmreply.topics ) ) {
      this.dataServ.topiclist.push({
        topic: value['TOPIC'],
        topicstr: value['TOPICSTR'],
        descr: value['DESCR'],
        pubscope: value['PUBSCOPE'],
        subscope: value['SUBSCOPE'],
        cluster: value['CLUSTER'],
        altdate: value['ALTDATE'],
        alttime: value['ALTTIME']
      });
     }
    } else { this.dataServ.topiclist = []; }
  }
  this.dataSourceTOPIC.data = this.dataServ.topiclist;
  this.dataSourceTOPIC.sort = this.TOPICSort;
  this.dataSourceTOPIC.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSourceTOPIC.filter = filterValue.trim().toLowerCase();
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataServ.topiclist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TOPICS');
    XLSX.writeFile(wb, this.dataServ.arrQMGRtemp.name + '_topics.xlsx');
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
