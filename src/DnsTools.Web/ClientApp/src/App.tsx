import React, {useState} from 'react';

import logo from './logo.svg';
import useIpData from './hooks/useIpData';
import useSignalrConnection from './hooks/useSignalrConnection';
import Ping from './components/Ping';
import Traceroute from './components/Traceroute';
import {Protocol, Config} from './types/generated';

type Props = {
  config: Readonly<Config>;
};

const App: React.FC<Props> = (props: Props) => {
  const ipData = useIpData();

  const [host, setHost] = useState();

  return (
    <div className="container">
      {host && (
        <Ping
          request={{
            host,
            protocol: 0, //Protocol.IPV4,
          }}
          workers={props.config.workers}
        />
      )}
      {/*{host && (
        <Traceroute
          ipData={ipData}
          request={{
            host,
            protocol: Protocol.Ipv4,
          }}
        />
        )}*/}
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
