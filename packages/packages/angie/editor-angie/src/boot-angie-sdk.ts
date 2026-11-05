import {
	AngieMcpSdk,
	LAYOUT_SIDEBAR,
	type LoadSidebarV2Options,
	toggleAngieSidebar,
} from '@elementor-external/angie-sdk';

export const EDITOR_ANGIE_APP_ID = 'elementor-editor';
export const EDITOR_ANGIE_CONTAINER_ID = 'elementor-editor-angie';

let sdk: AngieMcpSdk | null = null;
let bootPromise: Promise< AngieMcpSdk > | null = null;

export const getLoadSidebarOptions = (): LoadSidebarV2Options => ( {
	host: {
		appId: EDITOR_ANGIE_APP_ID,
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

export const openAngieIframe = () => {
	const iframe = document.getElementById( EDITOR_ANGIE_CONTAINER_ID )?.querySelector( 'iframe' );

	if ( ! iframe ) {
		return;
	}

	toggleAngieSidebar( iframe, true );
};

export const resetAngieSdkForTests = () => {
	sdk = null;
	bootPromise = null;
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
			const instance = new AngieMcpSdk();

			await instance.loadSidebarV2( getLoadSidebarOptions() );
			openAngieIframe();

			sdk = instance;

			return instance;
		} catch ( error ) {
			bootPromise = null;
			sdk = null;
			throw error;
		}
	} )();

	return bootPromise;
};
