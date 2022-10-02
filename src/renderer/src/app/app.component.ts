import { Component, ViewChild, ChangeDetectorRef, ElementRef, OnDestroy, AfterViewInit, HostBinding, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer} from '@angular/cdk/overlay';
// import { HttpClient } from '@angular/common/http';
// import { HttpErrorResponse } from '@angular/common/http';
import { NavService } from './components/menu-list-item/nav.service';
import { FormControl, FormGroup, Validators, FormBuilder, NgForm} from '@angular/forms';
import { DataService } from './common/data.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-qmdialog-dialog',
  templateUrl: './components/qmdialog/qmdialog-dialog.html',
  styleUrls: ['./components/qmdialog/qmdialog-dialog.css']
})
export class DialogContentQMDialogComponent implements OnInit {
  qmForm: FormGroup;
  objectKeys = Object.keys;

  constructor(public dialog: MatDialogModule, public dataServ: DataService, private snackBar: MatSnackBar, private formBuilder: FormBuilder) { }
  ngOnInit() {
    this.qmForm = new FormGroup({
     group: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
     name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
     hostname: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]),
     port: new FormControl('', [Validators.required]),
     channel: new FormControl('', [Validators.required]),
     ssl: new FormControl(''),
     sslkey: new FormControl(''),
     sslpass: new FormControl(''),
     sslcipher: new FormControl('')
    }, { updateOn: 'blur' });
  }
  public hasError = (controlName: string, errorName: string) => {
    return this.qmForm.controls[controlName].hasError(errorName);
  }
  createQM() {
    if (this.qmForm.valid) {
    const qmgrinfo = {
      name: this.qmForm.value.name.toUpperCase( ),
      iconName: 'more_vert',
      hostname: this.qmForm.value.hostname,
      port: this.qmForm.value.port,
      channel: this.qmForm.value.channel,
      ssl: this.qmForm.value.ssl,
      sslkey: this.qmForm.value.sslkey !== '' ? (window.btoa(this.qmForm.value.sslkey)).replace(new RegExp( '=', 'g'), '') : '',
      sslpass: this.qmForm.value.sslpass,
      sslcipher: this.qmForm.value.sslcipher,
      children: [
        { name: 'Qmanager',            iconName: 'devices_other', route: 'showQmgr'    },
        { name: 'Queues',              iconName: 'devices_other', route: 'showQueues'  },
        { name: 'Channels',            iconName: 'devices_other', route: 'showChannels'},
        { name: 'Authority records',   iconName: 'lock',          route: 'showAuthR'   },
        { name: 'Topics',              iconName: 'devices_other', route: 'showTopics'  },
        { name: 'Subscriptions',       iconName: 'devices_other', route: 'showSubs'    },
        { name: 'Delete',              iconName: 'close',         route: 'deleteQM'    }
      ]
     };
    if (this.dataServ.arrQMGR && this.dataServ.arrQMGR.some(e => e.name === this.qmForm.value.group.toUpperCase( ))) {
      this.dataServ.arrQMGR.find(e => e.name === this.qmForm.value.group.toUpperCase( )).children.push(qmgrinfo);
    } else {
      if (Array.isArray(this.dataServ.arrQMGR)) {
        this.dataServ.arrQMGR.push({
          name: this.qmForm.value.group.toUpperCase( ),
          iconName: 'apps',
          children: [qmgrinfo]
         });
      } else {
        this.dataServ.arrQMGR = [{
          name: this.qmForm.value.group.toUpperCase( ),
          iconName: 'apps',
          children: [qmgrinfo]
        }];
      }
      
    }
    const qmreply = window.electronIpcSendSync('updateQM', JSON.stringify(this.dataServ.arrQMGR));
    this.snackBar.open(qmreply, '', {
      duration: 3000,
    });
  //  const data = window.electronIpcSendSync('updateQMList', '');
  //  this.dataServ.arrQMGR = JSON.parse(data);
    this.qmForm.reset();
    this.dialog.closeAll();
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('appDrawer', { static: false }) appDrawer: ElementRef;
  title = 'MidLEO';
  mobileQuery: MediaQueryList;
  qmForm: FormGroup;
  objectKeys = Object.keys;

  encryptSecretKey  = 'VMIDteam';

  private mobileQueryListener: () => void;

  constructor(
    public dataServ: DataService,
    private snackBar: MatSnackBar,
    public dialog: MatDialogModule,
    public overlayContainer: OverlayContainer,
 //   private httpService: HttpClient,
    private navService: NavService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
  //  this.mobileQuery.addListener(this.mobileQueryListener);
  }
  @HostBinding('class') componentCssClass;

 // ngOnDestroy(): void {
  //  this.mobileQuery.removeListener(this.mobileQueryListener);
 //  }

  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
  }
  ngOnInit() {



  window.electronIpcOnce('readQMListData', (event, arg) => {
    const data = JSON.parse(arg);
    this.dataServ.arrQMGR = data ;
  });
  window.electronIpcSend('readQMList');


  //  this.httpService.get('./assets/qmgrlist.json').subscribe(
  //    data => {
  //      this.arrQMGR = data as string [];
  //    },
  //    (err: HttpErrorResponse) => {
  //      console.log (err.message);
  //    }
  //  );
  }
  onSetTheme(theme) {
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
  }
  openQMDialog() {
    const dialogRef = this.dialog.open(DialogContentQMDialogComponent, { minWidth: 300 });
  }
  encryptThis(thistext: string) {
    return CryptoJS.AES.encrypt(thistext, this.encryptSecretKey).toString();
  }
  decryptThis(thistext: string) {
    return CryptoJS.AES.decrypt(thistext.toString().replace(/ /g, ''), this.encryptSecretKey).toString(CryptoJS.enc.Utf8);
  }
}

