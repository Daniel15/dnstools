import React from 'react';

import {commaSeparate} from '../utils/react';
import WithHovercard from './WithHovercard';

// Keep these in alphabetical order.
const providers = [
  {
    name: "Gullo's Hosting",
    tooltip: 'VPS hosting starting from $3.50 per year',
    url: 'https://hosting.gullo.me/',
  },
  {
    name: 'HostNamaste',
    tooltip:
      'VPS hosting in several countries around the world, starting at $10/year',
    url: 'https://www.hostnamaste.com/',
  },
  {
    name: 'Terrahost',
    tooltip: 'VPSes and dedicated servers in secure bunker datacenters',
    url: 'https://terrahost.com/',
  },
  {
    name: 'WebHorizon',
    tooltip: 'AMD EPYC NAT VPS hosting from £5.50 per year',
    url: 'https://webhorizon.in/',
  },
  {
    name: 'xTom',
    tooltip:
      'Simple, affordable, accessible cloud computing, in 10 data centers worldwide',
    url: 'https://v.ps/',
  },
  {
    name: 'Zappie Host',
    tooltip: 'VPS hosting in New Zealand and South Africa',
    url: 'https://zappiehost.com/',
  },
];

export default function FooterHostingProviders() {
  return (
    <>
      {commaSeparate(
        providers.map(provider => (
          <WithHovercard
            key={provider.name}
            location="top"
            tooltipBody={provider.tooltip}>
            <a
              href={`${provider.url}?utm_source=dnstools&utm_medium=footer&utm_campaign=dnstools-footer-links`}
              target="blank"
              onClick={() => {
                ga(
                  'send',
                  'event',
                  'Hosting Provider Link',
                  'click',
                  provider.name,
                );
              }}>
              {provider.name}
            </a>
          </WithHovercard>
        )),
        'and',
      )}
    </>
  );
}
