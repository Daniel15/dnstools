import React, {useState} from 'react';

import logo from './logo.svg';
import './App.css';
import useSignalrConnection from './hooks/useSignalrConnection';
import Ping from './components/Ping';

//import {Protocol} from './generated/dnstools';

// c:\apps\protobuf\bin\protoc --plugin=protoc-gen-ts_proto=.\node_modules\.bin\protoc-gen-ts_proto.cmd --ts_proto_out=./src/generated --proto_path=../../Proto ../../Proto/dnstools.proto

const App: React.FC = () => {
  const connection = useSignalrConnection();

  const [host, setHost] = useState();

  console.log(connection);

  return (
    <div className="App">
      {host && (
        <Ping
          request={{
            host,
            protocol: 0, //Protocol.IPV4,
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload!!!.!!!!!!
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
};

export default App;
