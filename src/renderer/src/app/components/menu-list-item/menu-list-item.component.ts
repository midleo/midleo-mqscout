import { DataService } from './../../common/data.service';
import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NavService } from './nav.service';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class MenuListItemComponent implements OnInit {

  expanded?: boolean = null;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: any;
  @Input() previtem: any;
  @Input() itemkey: number;
  @Input() depth: number;


  constructor(public navService: NavService,
              public dataServ: DataService,
              private snackBar: MatSnackBar,
              public router: Router) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {

  }

  onItemSelected(item: any, previtem: any, itemkey: number) {
    if (this.depth === 0) { this.dataServ.jsonkey = itemkey; this.dataServ.jsonkeychanged = true; }
    if (this.depth === 1) { this.dataServ.jsonsubkey = itemkey; this.dataServ.jsonkeychanged = true; }
    if (!item.children || !item.children.length) {
      if (item.route === 'deleteQM') {
        this.deleteQM();
      } else {
      this.snackBar.open('Data is loading. Please wait', '', {
        duration: 5000,
      });
      this.dataServ.loadthis = true;
      this.dataServ.arrQMGRtemp = previtem;
      this.router.navigate([item.route + '/:' + this.dataServ.jsonkey + this.dataServ.jsonsubkey]);
    }
     // this.navService.closeNav();
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }

  deleteQM() {
    this.dataServ.arrQMGR[this.dataServ.jsonkey].children.splice(this.dataServ.jsonsubkey, 1);
    if (!this.dataServ.arrQMGR[this.dataServ.jsonkey].children.length) {
      this.dataServ.arrQMGR.splice(this.dataServ.jsonkey, 1);
    }
    const qmreply = window.electronIpcSendSync('updateQM', JSON.stringify(this.dataServ.arrQMGR));
    this.snackBar.open(qmreply, '', {
      duration: 3000,
    });
  }
}
