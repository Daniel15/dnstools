import React from 'react';

type Props = {
  country: string;
};

export default function CountryFlag(props: Props) {
  try {
    const flag = require(`flag-icon-css/flags/4x3/${props.country.toLowerCase()}.svg`);
    return <img height={15} src={flag} width={20} />;
  } catch (ex) {
    // eg. flag doesn't exist
    return null;
  }
}
