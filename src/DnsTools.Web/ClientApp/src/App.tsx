import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {HubConnectionBuilder} from '@microsoft/signalr';

import {apiUrl} from './config';
import useIpData from './hooks/useIpData';
import SignalrContext from './SignalrContext';
import NavigationSideEffects from './components/NavigationSideEffects';
import {isPrerendering} from './utils/prerendering';

import DnsLookup from './pages/DnsLookup';
import DnsTraversal from './pages/DnsTraversal';
import Index from './pages/Index';
import Locations from './pages/Locations';
import Ping from './pages/Ping';
import Traceroute from './pages/Traceroute';
import Whois from './pages/Whois';

const connection = new HubConnectionBuilder()
  .withUrl(`${apiUrl}hub`)
  .withAutomaticReconnect()
  .build();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect to SignalR if not prerendering... when prerendering, we
    // just want to render the initial state.
    if (!isPrerendering) {
      connection
        .start()
        .then(() => setIsConnected(true))
        .catch(err => alert('Could not connect: ' + err.message));
      return () => {};
    }
  }, []);

  const ipData = useIpData(connection);
  return (
    <SignalrContext.Provider value={{connection, isConnected}}>
      <Router>
        <NavigationSideEffects />
        <div className="container">
          <Switch>
            <Route path="/" exact>
              <Index />
            </Route>
            <Route path="/lookup/:host/:type/" component={DnsLookup} />
            <Route path="/traversal/:host/:type/" component={DnsTraversal} />
            <Route
              path="/ping/:host/"
              render={routeProps => <Ping {...routeProps} ipData={ipData} />}
            />
            <Route
              path="/traceroute/:host/"
              render={routeProps => (
                <Traceroute {...routeProps} ipData={ipData} />
              )}
            />
            <Route path="/whois/:host/" component={Whois} />
            <Route path="/locations/">
              <Locations />
            </Route>

            {/* Dummy route for navigateWithReload() */}
            <Route path="/blank" render={() => null} />
          </Switch>
        </div>
      </Router>
    </SignalrContext.Provider>
  );
}
