import { Component, OnInit, OnDestroy,  ViewChild } from '@angular/core';
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
  selector: 'app-authlist-component',
  templateUrl: './authlist.component.html',
  styleUrls: ['../main/qmcontent.css']
})
export class AuthListComponent implements OnInit , OnDestroy {
  navigationSubscription;
  displayedAUTHIColumns: string[] = [
    'profile',
    'entity',
    'object_type',
    'auth_info',
    'entity_type'
    ];
    dataSourceAUTHI = new MatTableDataSource();

  @ViewChild('AUTHISort', {static: true}) AUTHISort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dataServ: DataService, public dialog: MatDialog, private router: Router, private electron: ElectronService) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.dataServ.jsonkeychanged) { this.dataServ.authlist = []; }
        this.getAUTHI();
      }
    });
  }

  ngOnInit() {
   if (this.dataServ.jsonkeychanged) { this.dataServ.authlist = []; }
   this.getAUTHI();
  }
  async getAUTHI() {
  this.dataServ.selectedQmgr = this.dataServ.arrQMGRtemp.name;

  if (!this.dataServ.authlist || this.dataServ.authlist.length < 1) {
    this.dataServ.jsonkeychanged = false;
    this.dataServ.authlist = [];
    let qmreply: any;
    try {
      qmreply = await this.electron.execPcfqd(this.dataServ.buildMqReadPayload('AUTHI'));
      this.dataServ.dataerr = false;
    } catch {
      qmreply = '';
      this.dataServ.dataerr = true;
    }
    if (qmreply.authinfo) {
  //  this.dataServ.authlistreply = qmreply.authinfo;
    for ( const [key, value] of Object.entries( qmreply.authinfo ) ) {
      this.dataServ.authlist.push({
        profile: value['PROFILE'],
        entity: value['ENTITY'],
        object_type: value['OBJECT_TYPE'],
        auth_info: value['AUTH_INFO'],
        entity_type: value['ENTITY_TYPE']
      });
     }
    } else { this.dataServ.authlist = []; }
  }
  this.dataSourceAUTHI.data = this.dataServ.authlist;
  this.dataSourceAUTHI.sort = this.AUTHISort;
  this.dataSourceAUTHI.paginator = this.paginator;
  }
  applyFilter(filterValue: string) {
    this.dataSourceAUTHI.filter = filterValue.trim().toLowerCase();
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataServ.authlist);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AUTHI');
    XLSX.writeFile(wb, this.dataServ.arrQMGRtemp.name + '_authi.xlsx');
  }
  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}
