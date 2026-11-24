import { AngieMcpSdk } from '@elementor-external/angie-sdk';

export const EDITOR_ANGIE_APP_ID = 'elementor-editor-core';

let sdk: AngieMcpSdk | undefined;

type DetectorAccess = {
	angieDetector?: { waitForReady(): Promise< { isReady: boolean } > };
};

class RetriableAngieSDK extends AngieMcpSdk {
	private detectionExpired = false;

	constructor( ...args: ConstructorParameters< typeof AngieMcpSdk > ) {
		super( ...args );

		( this as unknown as DetectorAccess ).angieDetector
			?.waitForReady()
			.then( ( { isReady } ) => {
				this.detectionExpired = ! isReady;
			} )
			.catch( () => undefined );
	}

	public hasDetectionExpired() {
		return this.detectionExpired;
	}

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
		throw new Error( 'Angie is not available' );
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

export const refreshAngieSdkIfDetectionExpired = () => {
	if ( ! ( sdk instanceof RetriableAngieSDK ) || ! sdk.hasDetectionExpired() ) {
		return false;
	}

	sdk.destroy();
	sdk = undefined;

	return true;
};

export const resetAngieSdkForTests = () => {
	sdk = undefined;
};
