import { AngieMcpSdk } from '@elementor-external/angie-sdk';

export const EDITOR_ANGIE_APP_ID = 'elementor-editor-core';

let sdk: AngieMcpSdk | undefined;

class RetriableAngieSDK extends AngieMcpSdk {
	public async waitForReady(): Promise< void > {
		let retryCount = 3;
		while ( retryCount > 0 ) {
			try {
				await super.waitForReady();
				return;
			} catch {
				retryCount--;
				await sleep();
			}
		}
		return new Promise( () => {} ); // never resolves
	}
}

const sleep = ( ms = 10_000 ) =>
	new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );

const isMcpDisabled = () =>
	// @ts-ignore - QUnit fails this
	!! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;

export const getAngieSdk = (): AngieMcpSdk => {
	if ( isMcpDisabled() ) {
		return {} as unknown as AngieMcpSdk;
	}

	sdk ??= new RetriableAngieSDK( { appId: EDITOR_ANGIE_APP_ID } );

	return sdk;
};

export const resetAngieSdkForTests = () => {
	sdk = undefined;
};
