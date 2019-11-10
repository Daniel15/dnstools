import React, {useState} from 'react';

import logo from './logo.svg';
import useIpData from './hooks/useIpData';
import useSignalrConnection from './hooks/useSignalrConnection';
import Ping from './components/Ping';
import Traceroute from './components/Traceroute';
import {Protocol} from './types/generated';

const App: React.FC = () => {
  const ipData = useIpData();

  const [host, setHost] = useState();

  return (
    <div>
      {/*host && (
        <Ping
          request={{
            host,
            protocol: 0, //Protocol.IPV4,
          }}
        />
        )*/}
      {host && (
        <Traceroute
          ipData={ipData}
          request={{
            host,
            protocol: Protocol.Ipv4,
          }}
        />
      )}
      <button
        type="button"
        onClick={() => {
          setHost('google.com');
          /*connection.send("helloWorld", "Hello at " + Date.now());
          connection
            .invoke("helloWorld", "Hello2 at " + Date.now())
            .then(result => {
              console.log("res", result);
            });*/
          /*connection
            .stream('ping', {
              host: 'www.google.com',
            })
            .subscribe({
              next: item => {
                console.log('stream: ', item);
              },
              complete: () => {
                console.log('stream complete');
              },
              error: err => {
                console.error(err);
              },
            });*/
        }}>
        Hello
      </button>
    </div>
  );
};

export default App;
