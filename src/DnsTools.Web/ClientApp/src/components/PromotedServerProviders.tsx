import React from 'react';

import {commaSeparate} from '../utils/react';
import WithHovercard from './WithHovercard';
import {trackEvent} from '../analytics';

// Keep these in alphabetical order.
const providers = [
  {
    name: 'Advin Servers',
    tooltip:
      'Fast VPSes with a large amount of RAM and storage, starting at $7.99/month',
    url: 'https://advinservers.com/',
  },
  {
    name: 'FreeVPS',
    tooltip: 'Free VPS for active users of LowEndTalk and LowEndSpirit forums',
    url: 'https://freevps.org/',
  },
  {
    name: "Gullo's Hosting",
    tooltip: 'VPS hosting starting from $3.50 per year',
    url: 'https://hosting.gullo.me/',
  },
  {
    name: 'HostEONS',
    tooltip:
      'RYZEN NVME Premium VPS, Budget KVM SSD VPS and OpenVZ 7 VPS Hosting',
    url: 'https://hosteons.com/',
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
              rel="noreferrer"
              target="_blank"
              onClick={() => {
                trackEvent('Hosting Provider Link', {
                  props: {
                    provider_name: provider.name,
                  },
                });
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
