import { getAngieIframe, isAngiePluginAvailable, toggleAngieSidebar } from '@elementor-external/angie-sdk';

import { isAngiePluginActive } from './is-angie-plugin-active';

const PLUGIN_SIDEBAR_ID = 'angie-sidebar-container';

export const isAngiePluginInstalled = (): boolean => {
	if ( isAngiePluginActive() || isAngiePluginAvailable() ) {
		return true;
	}

	return Boolean( document.getElementById( PLUGIN_SIDEBAR_ID ) );
};

export const openInstalledAngieSidebar = (): boolean => {
	if ( ! isAngiePluginInstalled() ) {
		return false;
	}

	const iframe = getAngieIframe();

	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
	}

	if ( typeof window.toggleAngieSidebar === 'function' ) {
		window.toggleAngieSidebar( true );
	}

	return true;
};
