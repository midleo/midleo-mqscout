import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {

  selectedQmgr: any;
  selectedQmgrInfo: any;
  arrQMGR: any [] ;
  arrQMGRtemp: any ;

  loadthis = false;
  dataerr = false;
  qmgrdata: any [];
  qmgrcddata: any [];

  qlist: any [];
  qlistreply: [];

  chlist: any [];
//  chlistreply: [];

  topiclist: any [];
//  topiclistreply: [];

  sublist: any [];
//  sublistreply: [];

  authlist: any [];
//  authlistreply: [];

  systemobj = 'no';
  emptyobj = 'no';
  qiid: number;
  jsonkey: string | number;
  jsonsubkey: string | number;
  jsonkeychanged = false;
  objmapping = new Map([
    [ 'QUEUE', 'Queue Name' ],
    [ 'TYPE', 'Queue Type' ],
    [ 'ALTDATE', 'Altered Date' ],
    [ 'ALTTIME', 'Altered Time' ],
    [ 'CLUSTER', 'Cluster' ],
    [ 'CRDATE', 'Created Date' ],
    [ 'CRTIME', 'Created Time' ],
    [ 'DEFBIND', 'Default message binding' ],
    [ 'DEFPSIST', 'Default Persistence' ],
    [ 'DEPTH', 'Current Depth' ],
    [ 'DESCR', 'Description' ],
    [ 'MAXDEPTH', 'Maximum depth of queue' ],
    [ 'MAXMSGL', 'Maximum message length' ],
    [ 'MCAUSER', 'MCA user' ],
    [ 'CHANNEL', 'Channel Name' ],
    [ 'CHLTYPE' , 'Channel Type' ],
  ]);

  buildMqReadPayload(mqFunction: string, includeSystemObj = false): Record<string, unknown> {
    const qm = this.arrQMGRtemp;
    return {
      type: 'READ',
      hostname: qm.hostname,
      channel: qm.channel,
      port: qm.port,
      qmanager: qm.name,
      function: mqFunction,
      ...(includeSystemObj ? { systemobj: this.systemobj } : {}),
      ssl: qm.ssl ? qm.ssl : null,
      sslkey: qm.sslkey ? qm.sslkey : null,
      sslpass: qm.sslpass ? qm.sslpass : null,
      sslcipher: qm.sslcipher ? qm.sslcipher : null,
    };
  }
}
