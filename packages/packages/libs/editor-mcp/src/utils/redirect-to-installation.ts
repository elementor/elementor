import { setReferrerRedirect } from '@elementor-external/angie-sdk';

const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?s=angie&tab=search&type=term';

/**
 * @deprecated Kept only for Elementor Pro compatibility. Will be removed in a future version.
 * @param      prompt Optional prompt to pass after redirect.
 */
export const redirectToInstallation = ( prompt?: string ) => {
	setReferrerRedirect( window.location.href, prompt );
	window.location.href = ANGIE_INSTALL_URL;
};
