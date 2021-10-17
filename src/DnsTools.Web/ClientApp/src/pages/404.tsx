import {Helmet} from 'react-helmet';
import MainForm from '../components/MainForm';
import {useIsPrerendering} from '../utils/prerendering';

export default function FileNotFound() {
  const isPrerender = useIsPrerendering();
  return (
    <>
      <Helmet>
        <title>404 File Not Found</title>
      </Helmet>
      <h1 className="main-header">404 File Not Found</h1>
      <p className="lead">
        Sorry, the page you requested was not found. Try something else below.
      </p>
      <MainForm isLoading={isPrerender} isStandalone={true} />
    </>
  );
}
