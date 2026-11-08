import { getAngieIframe, isAngiePluginAvailable, toggleAngieSidebar } from '@elementor-external/angie-sdk';

import { EDITOR_ANGIE_CONTAINER_ID } from './boot-angie-sdk';
import { isAngiePluginActive } from './is-angie-plugin-active';

const PLUGIN_SIDEBAR_ID = 'angie-sidebar-container';

const getPluginAngieIframe = (): HTMLIFrameElement | null => {
	const iframe = getAngieIframe();

	if ( ! iframe ) {
		return null;
	}

	const coreContainer = document.getElementById( EDITOR_ANGIE_CONTAINER_ID );

	if ( coreContainer?.contains( iframe ) ) {
		return null;
	}

	return iframe;
};

export const canUseAngiePluginSidebar = (): boolean => {
	return Boolean( getPluginAngieIframe() || document.getElementById( PLUGIN_SIDEBAR_ID ) );
};

export const isAngiePluginInstalled = (): boolean => {
	return isAngiePluginActive() || isAngiePluginAvailable() || canUseAngiePluginSidebar();
};

export const openInstalledAngieSidebar = (): boolean => {
	const iframe = getPluginAngieIframe();
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
