import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { ElectronService } from '../../core/electron.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort } from '@angular/material/sort'; 
import { MatPaginator } from '@angular/material/paginator'; 
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  standalone: false,
  selector: 'app-dialog-qidialog',
  templateUrl: './dialog-qidialog.html',
})
export class DialogDataQIDialogComponent {
  constructor(public dataServ: DataService) {}
  QIdata = this.dataServ.qlistreply[this.dataServ.qiid];
}

@Component({
  standalone: false,
  selector: 'app-queuelist-component',
  templateUrl: './queuelist.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class QListComponent implements OnInit, OnDestroy {
  navigationSubscription;
  displayedQLColumns: string[] = [
    'name',
    'type',
    'crdate',
    'crtime',
    'depth',
    'maxdepth',
    'maxmsgl',
    'defbind',
    'altdate',
    'alttime',
    'actions'
  ];
  dataSourceQL = new MatTableDataSource();
  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router, private electron: ElectronService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.qlist = []; }
        this.getQL();
      }
    });
  }

  @ViewChild('QLSort', {static: true}) QLSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  ngOnInit() {
    if (this.dataServ.jsonkeychanged) { this.dataServ.qlist = []; }
    this.getQL();
  }
  async getQL() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;

  if (!this.dataServ.qlist || this.dataServ.qlist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.qlist = [];
    this.dataServ.qlistreply = [];
    let qmreply: any;
    try {
      qmreply = await this.electron.execPcfqd(this.dataServ.buildMqReadPayload('QUEUES', true));
      this.dataServ.dataerr = false;
    } catch {
      qmreply = '';
      this.dataServ.dataerr = true;
    }
    if (qmreply.queues) {
    this.dataServ.qlistreply = qmreply.queues;
    for ( const [key, value] of Object.entries( qmreply.queues ) ) {
      this.dataServ.qlist.push({
         objkey: key,
         name: value['QUEUE'],
         type: value['TYPE'],
         crdate: value['CRDATE'],
         crtime: value['CRTIME'],
         descr: value['DESCR'],
         depth: value['DEPTH'],
         maxdepth: value['MAXDEPTH'],
         maxmsgl: value['MAXMSGL'],
         cluster: value['CLUSTER'],
         defbind: value['DEFBIND'],
         altdate: value['ALTDATE'],
         alttime: value['ALTTIME'],
         defpsist: value['DEFPSIST']
      });
     }
    } else { this.dataServ.qlist = []; }
   }
  this.dataSourceQL.data = this.dataServ.qlist;
  this.dataSourceQL.sort = this.QLSort;
  this.dataSourceQL.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSourceQL.filter = filterValue.trim().toLowerCase();
  }
  openQIDialog(thisid: number) {
    this.dataServ.qiid = thisid;
    this.dialog.open(DialogDataQIDialogComponent, {
      minWidth: 400,
      maxWidth: '95vw',
      panelClass: 'qi-dialog-panel',
    });
  }

  browseQueue(element: any) {
    this.dataServ.selectedQueueName = element.name;
    this.dataServ.selectedQueueKey = element.objkey;
    this.router.navigate(['/browseQueue', this.dataServ.arrQMGRtemp.name]);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataServ.qlist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QUEUELIST');
    XLSX.writeFile(wb, this.dataServ.arrQMGRtemp.name + '_queues.xlsx');
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
