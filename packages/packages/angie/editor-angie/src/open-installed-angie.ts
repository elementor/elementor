import { getAngieIframe, isAngiePluginAvailable, toggleAngieSidebar } from '@elementor-external/angie-sdk';

import { isAngiePluginActive } from './is-angie-plugin-active';

const PLUGIN_SIDEBAR_ID = 'angie-sidebar-container';

export const canUseAngiePluginSidebar = (): boolean => {
	return Boolean( getAngieIframe() || document.getElementById( PLUGIN_SIDEBAR_ID ) );
};

export const isAngiePluginInstalled = (): boolean => {
	return isAngiePluginActive() || isAngiePluginAvailable() || canUseAngiePluginSidebar();
};

export const openInstalledAngieSidebar = (): boolean => {
	const iframe = getAngieIframe();
	const hasSidebarContainer = Boolean( document.getElementById( PLUGIN_SIDEBAR_ID ) );

	if ( ! iframe && ! hasSidebarContainer ) {
		return false;
	}

	let didOpen = false;

	if ( iframe ) {
		toggleAngieSidebar( iframe, true );
		didOpen = true;
	}

	if ( hasSidebarContainer && typeof window.toggleAngieSidebar === 'function' ) {
		window.toggleAngieSidebar( true );
		didOpen = true;
	}

	return didOpen;
};
