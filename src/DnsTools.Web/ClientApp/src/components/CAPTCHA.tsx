import React, {useEffect, useRef, useState, useCallback} from 'react';

import {apiUrl, ReCaptcha as ReCaptchaConfig} from '../config';
import {CaptchaResponse} from '../types/generated';
import Spinner from './Spinner';

let script: HTMLScriptElement | null = null;
let loadCallbacks: Array<() => void> = [];

declare global {
  interface Window {
    onCaptchaLoaded: () => void;
  }
}

window.onCaptchaLoaded = () => {
  loadCallbacks.forEach(cb => cb());
  loadCallbacks = [];
};

type Props = Readonly<{
  onVerifyStarted: () => void;
  onComplete: () => void;
}>;
export default function CAPTCHA(props: Props) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load ReCAPTCHA if not already loading
    if (script == null) {
      script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src =
        'https://www.google.com/recaptcha/api.js?onload=onCaptchaLoaded&render=explicit';
      document.head.appendChild(script);
    }

    // If ReCAPTCHA wasn't loaded when the component mounted, add to loading queue
    if (!window.grecaptcha) {
      loadCallbacks.push(() => setScriptLoaded(true));
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const {onComplete, onVerifyStarted} = props;
  const onCompleteWrapper = useCallback(
    async recaptchaResponse => {
      try {
        onVerifyStarted();
        const rawResponse = await fetch(`${apiUrl}/captcha`, {
          credentials: 'include',
          body: 'response=' + encodeURIComponent(recaptchaResponse),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          method: 'post',
        });
        const response: CaptchaResponse = await rawResponse.json();
        if (!response.success) {
          setError(response.error);
          return;
        }
        onComplete();
      } catch (ex) {
        setError(ex.message);
      }
    },
    [onComplete, onVerifyStarted],
  );

  useEffect(() => {
    if (!scriptLoaded || !ref.current) {
      return;
    }

    grecaptcha.render(ref.current, {
      sitekey: ReCaptchaConfig.siteKey,
      theme: 'dark',
      callback: onCompleteWrapper,
    });
  }, [onCompleteWrapper, scriptLoaded]);

  return (
    <>
      {!scriptLoaded && <Spinner />}
      {error && (
        <div className="alert alert-danger" role="alert">
          ERROR: {error}
        </div>
      )}
      <div ref={ref} />
    </>
  );
}
