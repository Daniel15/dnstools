import {createContext} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr';

const connection = new HubConnectionBuilder()
  .withUrl('/hub')
  .withAutomaticReconnect()
  .build();

connection.start().catch(err => alert('Could not connect: ' + err.message));

export default createContext(connection);
