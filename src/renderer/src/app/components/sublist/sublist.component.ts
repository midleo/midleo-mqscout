import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort } from '@angular/material/sort'; 
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sublist-component',
  templateUrl: './sublist.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class SubListComponent implements OnInit, OnDestroy {
  navigationSubscription;
  displayedSUBLColumns: string[] = [
    'sub',
    'topicstr',
    'topicobj',
    'dest',
    'destqmgr',
    'selector'
    ];
    dataSourceSUBL = new MatTableDataSource();

  @ViewChild('SUBLSort', {static: true}) SUBLSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.sublist = []; }
        this.getSUBL();
      }
    });
  }

  ngOnInit() {
    if (this.dataServ.jsonkeychanged) { this.dataServ.sublist = []; }
    this.getSUBL();
  }
  getSUBL() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;
//  this.dataServ.systemobj = thissysobj;
//  this.dataServ.emptyobj = thisemptyobj;

  if (!this.dataServ.sublist || this.dataServ.sublist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.sublist = [];
//    this.dataServ.sublistreply = [];
    const QMGRinput = {
      type: 'READ',
      hostname: this.dataServ.arrQMGRtemp.hostname,
      channel: this.dataServ.arrQMGRtemp.channel,
      port: this.dataServ.arrQMGRtemp.port,
      qmanager: this.dataServ.arrQMGRtemp.name,
      function: 'SUBS',
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
    if (qmreply.subs) {
  //  this.dataServ.sublistreply = qmreply.subs;
    for ( const [key, value] of Object.entries( qmreply.subs ) ) {
      this.dataServ.sublist.push({
        sub: value['SUB'],
        topicstr: value['TOPICSTR'],
        topicobj: value['TOPICOBJ'],
        dest: value['DEST'],
        destqmgr: value['DESTQMGR'],
        selector: value['SELECTOR'],
        subuser: value['SUBUSER'],
        altdate: value['ALTDATE'],
        alttime: value['ALTTIME'],
        crdate: value['CRDATE'],
        crtime: value['CRTIME']
      });
     }
    } else { this.dataServ.sublist = []; }
  }
  this.dataSourceSUBL.data = this.dataServ.sublist;
  this.dataSourceSUBL.sort = this.SUBLSort;
  this.dataSourceSUBL.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSourceSUBL.filter = filterValue.trim().toLowerCase();
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataServ.sublist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SUB_LIST');
    XLSX.writeFile(wb, this.dataServ.arrQMGRtemp.name + '_subs.xlsx');
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
