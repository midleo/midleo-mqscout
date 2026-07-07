import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { ElectronService } from '../../core/electron.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort } from '@angular/material/sort'; 
import { MatTableDataSource } from '@angular/material/table';


@Component({
  standalone: false,
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
  constructor(public dataServ: DataService, private router: Router, private electron: ElectronService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.qmgrdata = []; this.dataServ.qmgrcddata = []; }
        this.getQMI();
      }
    });
  }

  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    if (this.dataServ.jsonkeychanged) { this.dataServ.qmgrdata = [];  }
    this.getQMI();
  }
  async getQMI() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;
  this.dataServ.selectedQmgrInfo = 'Info about the qmanager';

  if (!this.dataServ.qmgrdata || this.dataServ.qmgrdata.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.qmgrdata = [];
    let qmreply: any;
    try {
      qmreply = await this.electron.execPcfqd(this.dataServ.buildMqReadPayload('QMGR'));
      this.dataServ.dataerr = false;
    } catch {
      qmreply = '';
      this.dataServ.dataerr = true;
    }
    if (qmreply.qmgr) {
    for (const property in qmreply.qmgr) {
      if(property){
        this.dataServ.qmgrdata.push({
          qmgrattr: property,
          qmgrdata: qmreply.qmgr[property]
         });
      }
     }
    } else { this.dataServ.qmgrdata = []; }
  }
  
  this.dataServ.qmgrcddata = [];
  this.dataServ.qmgrcddata.push({
    qmgrcd: "name",
    qmgrcdv: this.dataServ.arrQMGRtemp["name"]
   });
   this.dataServ.qmgrcddata.push({
    qmgrcd: "hostname",
    qmgrcdv: this.dataServ.arrQMGRtemp["hostname"]
   });
   this.dataServ.qmgrcddata.push({
    qmgrcd: "port",
    qmgrcdv: this.dataServ.arrQMGRtemp["port"]
   });
   this.dataServ.qmgrcddata.push({
    qmgrcd: "channel",
    qmgrcdv: this.dataServ.arrQMGRtemp["channel"]
   });

  this.dataSourceCD.data = this.dataServ.qmgrcddata;
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
