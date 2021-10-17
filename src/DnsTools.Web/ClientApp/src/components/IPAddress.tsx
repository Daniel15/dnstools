import {Link} from 'react-router-dom';

import WithHovercard from './WithHovercard';

type Props = Readonly<{
  address: string;
}>;

export default function IPAddress(props: Props) {
  return (
    <>
      {props.address}{' '}
      <sup>
        <Link to={`/whois/${props.address}/`}>
          <WithHovercard tooltipBody="View whois for this address">
            W
          </WithHovercard>
        </Link>{' '}
        <Link to={`/ping/${props.address}/`}>
          <WithHovercard tooltipBody="Ping this address">P</WithHovercard>
        </Link>
      </sup>
    </>
  );
}
