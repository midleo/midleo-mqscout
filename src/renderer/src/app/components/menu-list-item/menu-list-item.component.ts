import { DataService } from './../../common/data.service';
import { ElectronService } from '../../core/electron.service';
import { Component, HostBinding, Inject, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NavService } from './nav.service';

@Component({
  standalone: false,
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Remove connection?</h2>
    <mat-dialog-content>
      <p>Remove <strong>{{ data.qmName }}</strong> from group <strong>{{ data.groupName }}</strong>?</p>
      <p class="confirm-hint">This only removes the saved connection profile. It does not delete anything on the MQ server.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Remove</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-hint { font-size: 13px; color: var(--midleo-text-muted); margin-top: 8px; }
  `],
})
export class ConfirmDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { qmName: string; groupName: string }) {}
}

@Component({
  standalone: false,
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss'],
})
export class MenuListItemComponent implements OnInit {
  expanded = false;
  isDeleting = false;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: any;
  @Input() previtem: any;
  @Input() itemkey: any;
  @Input() groupIndex: number;
  @Input() qmIndex: number;
  @Input() depth: number;

  constructor(
    public navService: NavService,
    public dataServ: DataService,
    private snackBar: MatSnackBar,
    private electron: ElectronService,
    private dialog: MatDialog,
    public router: Router
  ) {
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {}

  isActiveRoute(route: string): boolean {
    if (!route || route === 'deleteQM') {
      return false;
    }
    const suffix = `:${this.dataServ.jsonkey}${this.dataServ.jsonsubkey}`;
    return this.router.url.includes(route + suffix) || this.router.url.includes(route + '/');
  }

  onItemSelected(item: any, previtem: any, itemkey: any, event?: Event) {
    event?.stopPropagation();

    if (item.children?.length) {
      this.expanded = !this.expanded;
      this.ariaExpanded = this.expanded;
      return;
    }

    if (this.depth === 0) {
      this.dataServ.jsonkey = this.groupIndex ?? itemkey;
      this.dataServ.jsonkeychanged = true;
    }
    if (this.depth >= 1 && !item.children?.length) {
      this.dataServ.jsonkey = this.groupIndex;
      this.dataServ.jsonsubkey = this.qmIndex;
      this.dataServ.jsonkeychanged = true;
    }

    if (item.route === 'deleteQM') {
      this.confirmDelete();
      return;
    }

    this.snackBar.open('Loading data…', '', { duration: 3000 });
    this.dataServ.loadthis = true;
    this.dataServ.arrQMGRtemp = previtem;
    this.router.navigate([item.route + '/:' + this.dataServ.jsonkey + this.dataServ.jsonsubkey]);
  }

  confirmDelete(): void {
    const resolved = this.resolveQmIndices();
    if (!resolved) {
      this.snackBar.open('Could not find queue manager to remove', '', { duration: 4000 });
      return;
    }

    const { groupIndex, childIndex, group, qm } = resolved;

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { qmName: qm.name, groupName: group.name },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        void this.deleteQM(groupIndex, childIndex);
      }
    });
  }

  private resolveQmIndices(): {
    groupIndex: number;
    childIndex: number;
    group: { name: string; children: unknown[] };
    qm: { name: string };
  } | null {
    const qm = this.previtem;
    if (!qm?.name) {
      return null;
    }

    if (this.groupIndex != null && this.qmIndex != null) {
      const group = this.dataServ.arrQMGR?.[this.groupIndex];
      const child = group?.children?.[this.qmIndex];
      if (group && child?.name === qm.name) {
        return { groupIndex: this.groupIndex, childIndex: this.qmIndex, group, qm };
      }
    }

    for (let i = 0; i < (this.dataServ.arrQMGR?.length ?? 0); i++) {
      const group = this.dataServ.arrQMGR[i];
      const children = group?.children ?? [];
      const j = children.findIndex(
        (c: { name?: string; hostname?: string }) =>
          c?.name === qm.name && (!qm.hostname || c.hostname === qm.hostname)
      );
      if (j >= 0) {
        return { groupIndex: i, childIndex: j, group, qm: children[j] };
      }
    }

    return null;
  }

  async deleteQM(groupIndex: number, childIndex: number) {
    if (this.isDeleting) {
      return;
    }
    this.isDeleting = true;

    const groups = [...this.dataServ.arrQMGR];
    groups[groupIndex] = { ...groups[groupIndex], children: [...groups[groupIndex].children] };
    groups[groupIndex].children.splice(childIndex, 1);

    if (!groups[groupIndex].children.length) {
      groups.splice(groupIndex, 1);
    }

    this.dataServ.arrQMGR = groups;
    this.dataServ.jsonkeychanged = true;

    try {
      const qmreply = await this.electron.updateQm(JSON.stringify(this.dataServ.arrQMGR));
      this.snackBar.open(qmreply, '', { duration: 3000 });
      this.router.navigate(['/']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update queue managers';
      this.snackBar.open(message, '', { duration: 5000 });
    } finally {
      this.isDeleting = false;
    }
  }

  trackByQmName(_index: number, child: { name?: string }): string {
    return child?.name ?? String(_index);
  }
}
