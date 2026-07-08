import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../common/data.service';
import { ElectronService } from '../../core/electron.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

interface QueueBrowseMessage {
  number: number;
  Encoding: number;
  CCSID: number;
  Format: string;
  UserIdentifier: string;
  PutApplName: string;
  PutDate: string;
  PutTime: string;
  MsgSeqNumber: number;
  CorrelId: string;
  MsgId: string;
  length: string;
  message: string;
}

@Component({
  standalone: false,
  selector: 'app-queue-browse-component',
  templateUrl: './queuebrowse.component.html',
  styleUrls: ['../main/qmcontent.css'],
})
export class QueueBrowseComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'number',
    'PutDate',
    'PutTime',
    'UserIdentifier',
    'PutApplName',
    'MsgSeqNumber',
    'length',
  ];

  dataSource = new MatTableDataSource<QueueBrowseMessage>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public dataServ: DataService,
    private electron: ElectronService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  async loadMessages(): Promise<void> {
    if (!this.dataServ.selectedQueueName) {
      this.dataSource.data = [];
      return;
    }

    this.dataServ.loadthis = true;
    let reply: any;

    try {
      reply = await this.electron.execPcfqd(
        this.dataServ.buildQueueBrowsePayload(this.dataServ.selectedQueueName)
      );
      this.dataServ.dataerr = !!reply?.error;
    } catch {
      reply = '';
      this.dataServ.dataerr = true;
    } finally {
      this.dataServ.loadthis = false;
    }

    if (reply && reply.messages) {
      const values = Object.values(reply.messages) as QueueBrowseMessage[];
      this.dataSource.data = values;
    } else {
      this.dataSource.data = [];
    }

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  goBackToQueueList(): void {
    const qmgrId = this.dataServ?.arrQMGRtemp?.name ?? this.dataServ.selectedQmgr;
    this.router.navigate(['/showQueues', qmgrId]);
  }
}

