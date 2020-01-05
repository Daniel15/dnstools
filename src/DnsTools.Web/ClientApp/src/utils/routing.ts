import {LocationDescriptorObject, History} from 'history';

/**
 * Navigates to the specified URI using React Router. If the URI is the same
 * as the current page URI, reload the page.
 */
export function navigateWithReload(
  history: History,
  newURI: LocationDescriptorObject,
): void {
  const currentURI = history.location;
  if (
    newURI.pathname !== currentURI.pathname ||
    (newURI.search != null &&
      newURI.search !== '' &&
      newURI.search !== currentURI.search)
  ) {
    history.push(newURI);
    return;
  }

  // The URI is the same, which means we need to 'refresh' the current page
  // (eg. resubmitting the form with the same data). React Router doesn't
  // provide a way to do this, so we need to navigate *away*, then navigate
  // back.
  history.replace('/blank');
  setTimeout(() => {
    history.replace(newURI);
  }, 0);
}
