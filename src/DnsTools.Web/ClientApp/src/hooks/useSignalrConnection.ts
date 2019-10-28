import {useContext} from 'react';
import SignalrContext from '../SignalrContext';

export default function useSignalrConnection() {
  return useContext(SignalrContext);
}
