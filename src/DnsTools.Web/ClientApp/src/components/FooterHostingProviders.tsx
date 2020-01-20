import React from 'react';

import {commaSeparate} from '../utils/react';
import WithHovercard, {HovercardLocation} from './WithHovercard';

// Keep these in alphabetical order.
const providers = [
  {
    name: 'Evolution Host',
    tooltip:
      'VPS Hosting, Game Servers, and IRC hosting starting at just €0.99/month',
    url: 'https://evolution-host.com/',
  },
  {
    name: "Gullo's Hosting",
    tooltip: 'VPS hosting starting from $3.50 per year',
    url: 'https://hosting.gullo.me/',
  },
  {
    name: 'MrVM',
    tooltip: 'VPS hosting starting from $4 per year',
    url: 'https://mrvm.net/natvps/',
  },
];

export default function FooterHostingProviders() {
  return (
    <>
      Server hosting sponsored by{' '}
      {commaSeparate(
        providers.map(provider => (
          <WithHovercard
            key={provider.name}
            location={HovercardLocation.Top}
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
      .
    </>
  );
}
