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

  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router, private electron: ElectronService) {
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
  async getCHL() {

  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;

  if (!this.dataServ.chlist || this.dataServ.chlist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.chlist = [];
    let qmreply: any;
    try {
      qmreply = await this.electron.execPcfqd(this.dataServ.buildMqReadPayload('CHANNELS', true));
      this.dataServ.dataerr = false;
    } catch {
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
