import React, {SVGProps} from 'react';

// Common country flags that are rendered (including all the countries workers exist in).
// These are embedded directly as React components. All other countries are lazily loaded as needed.
import {ReactComponent as at} from 'flag-icon-css/flags/4x3/at.svg';
import {ReactComponent as au} from 'flag-icon-css/flags/4x3/au.svg';
import {ReactComponent as be} from 'flag-icon-css/flags/4x3/be.svg';
import {ReactComponent as bg} from 'flag-icon-css/flags/4x3/bg.svg';
import {ReactComponent as ca} from 'flag-icon-css/flags/4x3/ca.svg';
import {ReactComponent as ch} from 'flag-icon-css/flags/4x3/ch.svg';
import {ReactComponent as de} from 'flag-icon-css/flags/4x3/de.svg';
import {ReactComponent as ee} from 'flag-icon-css/flags/4x3/ee.svg';
import {ReactComponent as fi} from 'flag-icon-css/flags/4x3/fi.svg';
import {ReactComponent as fr} from 'flag-icon-css/flags/4x3/fr.svg';
import {ReactComponent as gb} from 'flag-icon-css/flags/4x3/gb.svg';
import {ReactComponent as hk} from 'flag-icon-css/flags/4x3/hk.svg';
import {ReactComponent as india} from 'flag-icon-css/flags/4x3/in.svg';
import {ReactComponent as it} from 'flag-icon-css/flags/4x3/it.svg';
import {ReactComponent as jp} from 'flag-icon-css/flags/4x3/jp.svg';
import {ReactComponent as lu} from 'flag-icon-css/flags/4x3/lu.svg';
import {ReactComponent as no} from 'flag-icon-css/flags/4x3/no.svg';
import {ReactComponent as nl} from 'flag-icon-css/flags/4x3/nl.svg';
import {ReactComponent as nz} from 'flag-icon-css/flags/4x3/nz.svg';
import {ReactComponent as pl} from 'flag-icon-css/flags/4x3/pl.svg';
import {ReactComponent as ro} from 'flag-icon-css/flags/4x3/ro.svg';
import {ReactComponent as ru} from 'flag-icon-css/flags/4x3/ru.svg';
import {ReactComponent as se} from 'flag-icon-css/flags/4x3/se.svg';
import {ReactComponent as sg} from 'flag-icon-css/flags/4x3/sg.svg';
import {ReactComponent as tw} from 'flag-icon-css/flags/4x3/tw.svg';
import {ReactComponent as us} from 'flag-icon-css/flags/4x3/us.svg';
import {ReactComponent as vn} from 'flag-icon-css/flags/4x3/vn.svg';
import {ReactComponent as za} from 'flag-icon-css/flags/4x3/za.svg';

const commonFlags: Record<
  string,
  React.FunctionComponent<SVGProps<SVGSVGElement>>
> = {
  at,
  au,
  be,
  bg,
  ca,
  ch,
  de,
  ee,
  fi,
  fr,
  gb,
  hk,
  in: india,
  it,
  jp,
  lu,
  no,
  nl,
  nz,
  pl,
  ru,
  ro,
  se,
  sg,
  tw,
  us,
  vn,
  za,
};

const otherFlagsContext = require.context(
  'flag-icon-css/flags/4x3/',
  false,
  /^\.\/(?!at|au|be|bg|ca|ch|de|ee|fi|fr|gb|hk|in|it|jp|lu|no|nl|nz|pl|ro|ru|se|sg|tw|us|vn|za).+\.svg$/,
);

type Props = {
  country: string;
  size?: number;
};

export default function CountryFlag(props: Props) {
  const country = props.country.toLowerCase();
  const width = props.size || 15;
  const height = (width * 4) / 3;

  // Check if it's a "common" flag
  const Component = commonFlags[country];
  if (Component != null) {
    return <Component className="mr-1" height={height} width={width} />;
  }

  // Try to find the image
  try {
    const flag = otherFlagsContext(`./${country}.svg`).default;
    return (
      <img
        alt={`${props.country} flag`}
        className="mr-1"
        height={height}
        src={flag}
        width={(width * 4) / 3}
      />
    );
  } catch (ex) {
    // eg. flag doesn't exist
    return null;
  }
}
