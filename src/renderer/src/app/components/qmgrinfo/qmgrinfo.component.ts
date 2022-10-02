import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort } from '@angular/material/sort'; 
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-qmgrinfo-component',
  templateUrl: './qmgrinfo.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class QMGRInfoComponent implements OnInit, OnDestroy {
  navigationSubscription;
  displayedQMColumns: string[] = ['qmgrattr', 'qmgrdata'];
  displayedCDColumns: string[] = ['qmgrcd', 'qmgrcdv'];
  qmgrcd: any;

  dataSource = new MatTableDataSource();
  dataSourceCD = new MatTableDataSource();
  constructor(public dataServ: DataService, private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.qmgrdata = []; }
        this.getQMI();
      }
    });
  }

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    if (this.dataServ.jsonkeychanged) { this.dataServ.qmgrdata = []; }
    this.getQMI();
  }
  getQMI() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;
  this.dataServ.selectedQmgrInfo = 'Info about the qmanager';

  if (!this.dataServ.qmgrdata || this.dataServ.qmgrdata.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.qmgrdata = [];
    const QMGRinput = {
      type: 'READ',
      hostname: this.dataServ.arrQMGRtemp.hostname,
      channel: this.dataServ.arrQMGRtemp.channel,
      port: this.dataServ.arrQMGRtemp.port,
      qmanager: this.dataServ.arrQMGRtemp.name,
      function: 'QMGR',
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
    if (qmreply.qmgr) {
    for (const property in qmreply.qmgr) {
      this.dataServ.qmgrdata.push({
        qmgrattr: property,
        qmgrdata: qmreply.qmgr[property]
       });
     }
    } else { this.dataServ.qmgrdata = []; }
  }
  for (const property in this.dataServ.arrQMGRtemp) {
    this.dataServ.qmgrdata.push({
      qmgrcd: property,
      qmgrcdv: this.dataServ.arrQMGRtemp[property]
     });
  }
  this.dataSourceCD.data = this.qmgrcd;
  this.dataSource.data = this.dataServ.qmgrdata;
  this.dataSource.sort = this.sort;
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
