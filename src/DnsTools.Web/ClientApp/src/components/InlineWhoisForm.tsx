import React, {useState, FormEvent} from 'react';
import {useHistory} from 'react-router';

import {navigateWithReload} from '../utils/routing';

type Props = Readonly<{
  initialHost: string;
}>;

export default function InlineWhoisForm(props: Props) {
  const [host, setHost] = useState(props.initialHost);
  const history = useHistory();

  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    navigateWithReload(history, {
      pathname: `/whois/${host}/`,
    });
  }

  return (
    <form className="form-inline" onSubmit={onSubmit}>
      <label className="my-1 mr-2" htmlFor="inline-host">
        Host:
      </label>
      <input
        className="form-control col-4 mr-sm-2"
        id="inline-host"
        type="text"
        value={host}
        onChange={evt => setHost(evt.target.value)}
      />
      <button type="submit" className="btn btn-primary my-1">
        Lookup
      </button>
    </form>
  );
}
