import React, {useState, useEffect, useCallback} from 'react';
import Helmet from 'react-helmet';
import {RouteComponentProps} from 'react-router-dom';

import {Config} from '../types/generated';
import InlineWhoisForm from '../components/InlineWhoisForm';
import Spinner from '../components/Spinner';
import CAPTCHA from '../components/CAPTCHA';
import MainForm, {getDefaultInput, Tool} from '../components/MainForm';
import ShimmerBar from '../components/ShimmerBar';

type Props = RouteComponentProps<{
  host: string;
  type: string;
}> & {
  config: Config;
};

export default function Whois(props: Props) {
  const {host} = props.match.params;
  const [isLoading, setIsLoading] = useState<boolean>();
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [showCaptcha, setShowCaptcha] = useState<boolean>(false);
  const [forceLoadInc, setForceLoadInc] = useState<number>(0);

  // These need to be memoized with useCallback() so the CAPTCHA doesn't re-render
  // Forces a refresh after the CAPTCHA is completed
  const forceReload = useCallback(() => setForceLoadInc(x => x + 1), []);
  const captchaVerifyStarted = useCallback(() => setIsLoading(true), []);

  useEffect(() => {
    let didCancel = false;

    async function load() {
      try {
        setIsLoading(true);
        setResults(null);
        setError(null);
        setShowCaptcha(false);
        const rawResponse = await fetch(`/data/whois/${host}/`, {
          credentials: 'include',
        });
        const response = await rawResponse.text();
        setIsLoading(false);
        if (didCancel) {
          // Hack since fetch is not cancellable
          return;
        }

        // Yeah, this is very ugly, however it'll be changed when the WHOIS code
        // is rewritten to return data in a more structured format.
        if (response.trim() === 'SHOW-CAPTCHA') {
          setResults(null);
          setShowCaptcha(true);
          return;
        }

        setResults(response);
      } catch (ex) {
        setError(ex.message);
      }
    }

    load();
    return () => {
      didCancel = true;
    };
  }, [host, forceLoadInc]);

  return (
    <>
      <Helmet>
        <title>WHOIS for {host}</title>
      </Helmet>
      <h1 className="main-header">
        WHOIS for {host} {isLoading && <Spinner />}
      </h1>
      <InlineWhoisForm initialHost={host} />
      {error && (
        <div className="alert alert-danger" role="alert">
          ERROR: {error.message}
        </div>
      )}
      {showCaptcha && (
        <CAPTCHA
          reCaptchaKey={props.config.reCaptchaKey}
          onComplete={forceReload}
          onVerifyStarted={captchaVerifyStarted}
        />
      )}
      <div dangerouslySetInnerHTML={{__html: results || ''}} />
      {isLoading && <ShimmerBar />}
      {results && (
        <MainForm
          config={props.config}
          initialInput={{
            ...getDefaultInput(props.config),
            host,
          }}
          initialSelectedTool={Tool.Whois}
          isStandalone={true}
        />
      )}
    </>
  );
}
