import { Component, ViewChild, ChangeDetectorRef, ElementRef, OnDestroy, AfterViewInit, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSidenav } from '@angular/material/sidenav';
import { NavService } from './components/menu-list-item/nav.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from './common/data.service';
import { ElectronService } from './core/electron.service';

export const QM_NAV_CHILDREN = [
  { name: 'Queue manager', iconName: 'dns', route: 'showQmgr' },
  { name: 'Queues', iconName: 'queue', route: 'showQueues' },
  { name: 'Channels', iconName: 'sync_alt', route: 'showChannels' },
  { name: 'Authority records', iconName: 'lock', route: 'showAuthR' },
  { name: 'Topics', iconName: 'topic', route: 'showTopics' },
  { name: 'Subscriptions', iconName: 'notifications', route: 'showSubs' },
  { name: 'Remove connection', iconName: 'delete_outline', route: 'deleteQM', danger: true },
];

@Component({
  standalone: false,
  selector: 'app-qmdialog-dialog',
  templateUrl: './components/qmdialog/qmdialog-dialog.html',
  styleUrls: ['./components/qmdialog/qmdialog-dialog.css']
})
export class DialogContentQMDialogComponent implements OnInit {
  qmForm: FormGroup;
  isSaving = false;

  constructor(private _dialog: MatDialog, public dataServ: DataService, private snackBar: MatSnackBar, private formBuilder: FormBuilder, private electron: ElectronService) { }
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
    }, { updateOn: 'change' });
  }
  public hasError = (controlName: string, errorName: string) => {
    return this.qmForm.controls[controlName].hasError(errorName);
  }
  async createQM() {
    this.qmForm.markAllAsTouched();
    this.qmForm.updateValueAndValidity();
    if (!this.qmForm.valid) {
      this.snackBar.open('Please fill in all required fields', '', { duration: 4000 });
      return;
    }

    const qmgrinfo = {
      name: this.qmForm.value.name.toUpperCase( ),
      iconName: 'more_vert',
      hostname: this.qmForm.value.hostname,
      port: this.qmForm.value.port,
      channel: this.qmForm.value.channel,
      ssl: this.qmForm.value.ssl !=''? this.qmForm.value.ssl : null,
      sslkey: this.qmForm.value.sslkey !== '' ? (window.btoa(this.qmForm.value.sslkey)).replace(new RegExp( '=', 'g'), '') : null,
      sslpass: this.qmForm.value.sslpass !=''? this.qmForm.value.sslpass : null,
      sslcipher: this.qmForm.value.sslcipher !=''? this.qmForm.value.sslcipher : null,
      children: QM_NAV_CHILDREN.map((c) => ({ ...c })),
     };
    const groupName = this.qmForm.value.group.toUpperCase();
    const groups = Array.isArray(this.dataServ.arrQMGR)
      ? this.dataServ.arrQMGR.filter((g) => g && g.name && Array.isArray(g.children))
      : [];

    let nextGroups: typeof groups;
    if (groups.some((e) => e.name === groupName)) {
      nextGroups = groups.map((g) =>
        g.name === groupName
          ? { ...g, children: [...g.children, qmgrinfo] }
          : { ...g, children: [...g.children] }
      );
    } else {
      nextGroups = [
        ...groups,
        {
          name: groupName,
          iconName: 'apps',
          children: [qmgrinfo],
        },
      ];
    }
    this.dataServ.arrQMGR = nextGroups;

    this.isSaving = true;
    try {
      const qmreply = await this.electron.updateQm(JSON.stringify(this.dataServ.arrQMGR));
      this.snackBar.open(qmreply, '', { duration: 3000 });
      this.qmForm.reset();
      this._dialog.closeAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save queue manager';
      this.snackBar.open(message, '', { duration: 5000 });
    } finally {
      this.isSaving = false;
    }
  }
}

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('snav', { static: false }) snav: MatSidenav;
  @ViewChild('appDrawer', { static: false }) appDrawer: ElementRef;
  title = 'Midleo MQScout';
  mobileQuery: MediaQueryList;
  sidenavOpened = true;
  activeTheme = 'midleo-light-theme';

  private mobileQueryListener: () => void;

  constructor(
    public dataServ: DataService,
    private snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private electron: ElectronService,
    public overlayContainer: OverlayContainer,
    private navService: NavService,
    private cdr: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => this.cdr.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }
  @HostBinding('class') componentCssClass: string;

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  trackByGroupName(_index: number, item: { name?: string }): string {
    return item?.name ?? String(_index);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
  }
  async ngOnInit() {
    this.onSetTheme(this.activeTheme);
    try {
      const raw = await this.electron.readQmList();
      const parsed = JSON.parse(raw);
      this.dataServ.arrQMGR = Array.isArray(parsed)
        ? parsed.filter((g) => g && g.name && Array.isArray(g.children))
        : [];
    } catch (error) {
      this.dataServ.arrQMGR = [];
      const message = error instanceof Error ? error.message : 'Unable to load saved queue managers';
      this.snackBar.open(message, '', { duration: 4000 });
    }
  }
  onSetTheme(theme: string) {
    if (!theme) {
      return;
    }
    this.activeTheme = theme;
    const root = document.documentElement;
    root.classList.remove('midleo-dark-theme', 'midleo-light-theme');
    root.classList.add(theme);
    document.body.classList.remove('midleo-dark-theme', 'midleo-light-theme');
    document.body.classList.add(theme);
    this.overlayContainer.getContainerElement().classList.remove('midleo-dark-theme', 'midleo-light-theme');
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
  }
  openQMDialog() {
    const dialogRef = this._dialog.open(DialogContentQMDialogComponent, { minWidth: 420, maxWidth: '95vw', panelClass: 'qm-dialog-panel' });
    dialogRef.afterClosed().subscribe(() => {
      if (Array.isArray(this.dataServ.arrQMGR)) {
        this.dataServ.arrQMGR = this.dataServ.arrQMGR.map((g) => ({
          ...g,
          children: Array.isArray(g.children) ? [...g.children] : [],
        }));
      }
      this.cdr.detectChanges();
    });
  }
}

