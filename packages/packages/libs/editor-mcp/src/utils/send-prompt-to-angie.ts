import { getAngieIframe, toggleAngieSidebar } from '@elementor-external/angie-sdk';

export const sendPromptToAngie = ( prompt?: string ) => {
  const angieSidebar = getAngieIframe();

  if ( ! angieSidebar ) {
    return;
  }

  toggleAngieSidebar( angieSidebar, true );

  if ( ! prompt ) {
    return;
  }

  window.location.hash = `angie-prompt=${ encodeURIComponent( prompt ) }`;
};
