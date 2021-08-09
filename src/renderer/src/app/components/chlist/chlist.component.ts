import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataService } from '../../common/data.service';
import { Router , NavigationEnd } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource, MatDialog} from '@angular/material';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-chlist-component',
  templateUrl: './chlist.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class CHListComponent implements OnInit, OnDestroy {
  navigationSubscription;
  displayedCHLColumns: string[] = [
    'name',
    'type',
    'mca',
    'altdate',
    'alttime'
    ];
    dataSourceCHL = new MatTableDataSource();

  @ViewChild('CHLSort', {static: true}) CHLSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.chlist = []; }
        this.getCHL();
      }
    });
   }

  ngOnInit() {
   if (this.dataServ.jsonkeychanged) { this.dataServ.chlist = []; }
   this.getCHL();
  }
  getCHL() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;
//  this.dataServ.systemobj = thissysobj;
//  this.dataServ.emptyobj = thisemptyobj;

  if (!this.dataServ.chlist || this.dataServ.chlist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.chlist = [];
  //  this.dataServ.chlistreply = [];
    const QMGRinput = {
      type: 'READ',
      hostname: this.dataServ.arrQMGRtemp.hostname,
      channel: this.dataServ.arrQMGRtemp.channel,
      port: this.dataServ.arrQMGRtemp.port,
      qmanager: this.dataServ.arrQMGRtemp.name,
      function: 'CHANNELS',
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
    if (qmreply.channels) {
  //  this.dataServ.chlistreply = qmreply.channels;
    for ( const [key, value] of Object.entries( qmreply.channels ) ) {
      this.dataServ.chlist.push({
         name: value['CHANNEL'],
         type: value['CHLTYPE'],
         altdate: value['ALTDATE'],
         alttime: value['ALTTIME'],
         mca: value['MCAUSER']
      });
     }
    } else { this.dataServ.chlist = []; }
  }
  this.dataSourceCHL.data = this.dataServ.chlist;
  this.dataSourceCHL.sort = this.CHLSort;
  this.dataSourceCHL.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSourceCHL.filter = filterValue.trim().toLowerCase();
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataServ.chlist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CHANNELS');
    XLSX.writeFile(wb, this.dataServ.arrQMGRtemp.name + '_channels.xlsx');
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
