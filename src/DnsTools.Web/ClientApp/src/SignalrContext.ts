import {createContext} from 'react';
import {HubConnection} from '@microsoft/signalr';

export type SignalrContextType = {
  connection: HubConnection;
  isConnected: boolean;
};

export default createContext<SignalrContextType>({
  connection: null!, // Always set in App.tsx
  isConnected: false,
});
