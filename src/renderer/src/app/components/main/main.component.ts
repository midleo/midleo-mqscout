import { Component, OnInit, NgZone } from '@angular/core';
import { DataService } from '../../common/data.service';

@Component({
  selector: 'app-componentmain',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainContentComponent implements OnInit {

  constructor(public dataServ: DataService) { }

  ngOnInit() {
  //  this.dataServ.selectedQmgr = '';
  //  this.dataServ.selectedQmgrInfo = '';

  }
}
