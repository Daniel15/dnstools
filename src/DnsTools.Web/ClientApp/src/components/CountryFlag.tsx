import React, {SVGProps} from 'react';

// Common country flags that are rendered (including all the countries workers exist in).
// These are embedded directly as React components. All other countries are lazily loaded as needed.
import {ReactComponent as au} from 'flag-icon-css/flags/4x3/au.svg';
import {ReactComponent as bg} from 'flag-icon-css/flags/4x3/bg.svg';
import {ReactComponent as ca} from 'flag-icon-css/flags/4x3/ca.svg';
import {ReactComponent as de} from 'flag-icon-css/flags/4x3/de.svg';
import {ReactComponent as fi} from 'flag-icon-css/flags/4x3/fi.svg';
import {ReactComponent as fr} from 'flag-icon-css/flags/4x3/fr.svg';
import {ReactComponent as gb} from 'flag-icon-css/flags/4x3/gb.svg';
import {ReactComponent as hk} from 'flag-icon-css/flags/4x3/hk.svg';
import {ReactComponent as it} from 'flag-icon-css/flags/4x3/it.svg';
import {ReactComponent as lu} from 'flag-icon-css/flags/4x3/lu.svg';
import {ReactComponent as no} from 'flag-icon-css/flags/4x3/no.svg';
import {ReactComponent as nl} from 'flag-icon-css/flags/4x3/nl.svg';
import {ReactComponent as nz} from 'flag-icon-css/flags/4x3/nz.svg';
import {ReactComponent as pl} from 'flag-icon-css/flags/4x3/pl.svg';
import {ReactComponent as ro} from 'flag-icon-css/flags/4x3/ro.svg';
import {ReactComponent as ru} from 'flag-icon-css/flags/4x3/ru.svg';
import {ReactComponent as sg} from 'flag-icon-css/flags/4x3/sg.svg';
import {ReactComponent as us} from 'flag-icon-css/flags/4x3/us.svg';

const commonFlags: Record<
  string,
  React.FunctionComponent<SVGProps<SVGSVGElement>>
> = {
  au,
  bg,
  ca,
  de,
  fi,
  fr,
  gb,
  hk,
  it,
  lu,
  no,
  nl,
  nz,
  pl,
  ru,
  ro,
  sg,
  us,
};

const otherFlagsContext = require.context(
  'flag-icon-css/flags/4x3/',
  false,
  /^\.\/(?!au|bg|ca|de|fi|fr|gb|hk|it|lu|no|nl|nz|pl|ro|ru|sg|us).+\.svg$/,
);

type Props = {
  country: string;
};

export default function CountryFlag(props: Props) {
  const country = props.country.toLowerCase();

  // Check if it's a "common" flag
  const Component = commonFlags[country];
  if (Component != null) {
    return <Component className="mr-1" height={15} width={20} />;
  }

  // Try to find the image
  try {
    const flag = otherFlagsContext(`./${country}.svg`);
    return (
      <img
        alt={`${props.country} flag`}
        className="mr-1"
        height={15}
        src={flag}
        width={20}
      />
    );
  } catch (ex) {
    // eg. flag doesn't exist
    return null;
  }
}
