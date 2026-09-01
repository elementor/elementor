import { AngieMcpSdk } from '@elementor-external/angie-sdk';
export { getAngieIframe, MessageEventType } from '@elementor-external/angie-sdk';

export const ANGIE_SDK_DEFAULT_INSTANCE = 'default';
export const ANGIE_FLOATING_CHAT_INSTANCE = 'elementor-inline-floating-chat';

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
		return new Promise( ( _resolve, reject ) => {
			reject( new Error( 'Angie is not available' ) );
		} );
	}
}

const sleep = ( ms = 10_000 ) =>
	new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );

const sdkInstances = new Map< string, AngieMcpSdk >();

export const getSDK = ( instanceKey: string = ANGIE_SDK_DEFAULT_INSTANCE ): AngieMcpSdk => {
	// @ts-ignore - QUnit fails this
	const isMCPDisabled = !! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;
	if ( isMCPDisabled ) {
		return {} as unknown as AngieMcpSdk;
	}

	let sdk = sdkInstances.get( instanceKey );
	if ( ! sdk ) {
		sdk = new RetriableAngieSDK();
		sdkInstances.set( instanceKey, sdk );
	}

	return sdk;
};
