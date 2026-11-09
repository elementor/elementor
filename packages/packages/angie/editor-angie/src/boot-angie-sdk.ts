import {
	AngieMcpSdk,
	getAngieIframe,
	LAYOUT_SIDEBAR,
	type LoadSidebarV2Options,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

import { attachEditorMcpServers } from './attach-editor-mcp-servers';
import { ensureHelpCenterAbility } from './help-center-ability';

export const EDITOR_ANGIE_APP_ID = 'elementor-editor-core';
export const EDITOR_ANGIE_CONTAINER_ID = 'elementor-editor-angie';
export const ANGIE_SIDEBAR_ACTIVE_BODY_CLASS = 'angie-sidebar-active';

const CONTAINER_POLL_ATTEMPTS = 10;
const CONTAINER_POLL_INTERVAL_MS = 10;

let sdk: AngieMcpSdk | null = null;
let bootPromise: Promise< AngieMcpSdk > | null = null;

const waitForAngieContainer = async () => {
	for ( let attempt = 0; attempt < CONTAINER_POLL_ATTEMPTS; attempt++ ) {
		const container = document.getElementById( EDITOR_ANGIE_CONTAINER_ID );

		if ( container ) {
			container.style.display = 'flex';
			container.style.flexDirection = 'column';
			container.style.height = '100%';
			container.style.width = '100%';

			return;
		}

		await new Promise( ( resolve ) => {
			setTimeout( resolve, CONTAINER_POLL_INTERVAL_MS );
		} );
	}

	throw new Error(
		`Angie container #${ EDITOR_ANGIE_CONTAINER_ID } not found after ${ CONTAINER_POLL_ATTEMPTS } attempts`
	);
};

export const getLoadSidebarOptions = (): LoadSidebarV2Options => ( {
	host: {
		appId: EDITOR_ANGIE_APP_ID,
		instanceId: EDITOR_ANGIE_APP_ID,
	},
	container: {
		id: EDITOR_ANGIE_CONTAINER_ID,
		layout: LAYOUT_SIDEBAR,
		persistOpenState: false,
		chatToggleButton: {
			enabled: false,
			selector: '',
		},
	},
} );

export const removeAngieSidebarActiveBodyClass = () => {
	document.body.classList.remove( ANGIE_SIDEBAR_ACTIVE_BODY_CLASS );
};

export const openAngieIframe = () => {
	const iframe = getAngieIframe();

	if ( ! iframe ) {
		return;
	}

	removeAngieSidebarActiveBodyClass();
	toggleAngieSidebar( iframe, true );
};

export const resetAngieSdkForTests = () => {
	sdk = null;
	bootPromise = null;
	document.body.classList.remove( ANGIE_SIDEBAR_ACTIVE_BODY_CLASS );
};

export const bootAngieSdk = (): Promise< AngieMcpSdk > => {
	if ( sdk ) {
		return Promise.resolve( sdk );
	}

	if ( bootPromise ) {
		return bootPromise;
	}

	bootPromise = ( async () => {
		try {
			await waitForAngieContainer();

			const instance = new AngieMcpSdk();

			await instance.loadSidebarV2( getLoadSidebarOptions() );
			openAngieIframe();

			sdk = instance;

			void attachEditorMcpServers( instance ).catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( 'Angie editor MCP servers registration failed:', error );
			} );

			await ensureHelpCenterAbility( instance ).catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.error( 'Angie help-center ability registration failed:', error );
			} );

			return instance;
		} catch ( error ) {
			bootPromise = null;
			sdk = null;
			throw error;
		}
	} )();

	return bootPromise;
};
