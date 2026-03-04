import { setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?s=angie&tab=search&type=term';

export const redirectToInstallation = ( prompt: string ) => {
  const success = setReferrerRedirect( window.location.href, prompt );

  if ( ! success ) {
    return;
  }

  window.location.href = ANGIE_INSTALL_URL;
};
