import * as React from 'react';
import Helmet from 'react-helmet';
import LazyChart from '../components/LazyChart';
import PromotedServerProviders from '../components/PromotedServerProviders';

import Config from '../config.json';

export default function Locations() {
  return (
    <>
      <Helmet>
        <title>DNSTools Server Locations</title>
      </Helmet>
      <h1 className="main-header">DNSTools Server Locations</h1>
      <p>
        DNSTools currently has servers in {Config.workers.length} locations
        around the world:
      </p>
      <LazyChart
        options={{
          backgroundColor: '#222',
          tooltip: {
            isHtml: true,
          },
        }}
        chartType="GeoChart"
        data={[
          [
            {type: 'number', id: 'Latitude'},
            {type: 'number', id: 'Longitude'},
            {type: 'string', id: 'Location'},
            {type: 'string', role: 'tooltip'},
          ],
          ...Config.workers.map(worker => {
            let location = worker.locationDisplay;
            if (!location.includes(worker.city)) {
              // If location is not displayed with city name, prepend the city name
              location = `${worker.city}, ${location}`;
            }
            return [
              worker.latitude,
              worker.longitude,
              location,
              `Provider: ${worker.providerName} (AS${worker.networkAsn})\nData Center: ${worker.dataCenterName}`,
            ];
          }),
        ]}
        mapsApiKey={Config.googleMapsKey}
        width="100%"
        height={600}
      />
      <p>
        This growth has been made possible thanks to server sponsorship by{' '}
        <PromotedServerProviders />. If you're a hosting provider with services
        in other countries and would like to sponsor a DNSTools server, please
        get in touch with me via{' '}
        <a href="mailto:feedback@dns.tg">email to feedback@dns.tg</a>,{' '}
        <a href="https://twitter.com/Daniel15">Twitter</a>, or{' '}
        <a href="https://www.facebook.com/daaniel">Facebook</a>. This site is
        totally ad-free and relies on the generosity of hosting providers in
        order to continue expanding to other countries worldwide.
      </p>
    </>
  );
}
