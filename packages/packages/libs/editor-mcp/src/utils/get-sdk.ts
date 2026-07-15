import { AngieMcpSdk, isAngiePluginAvailable } from '@elementor-external/angie-sdk';
export { getAngieIframe, MessageEventType } from '@elementor-external/angie-sdk';

let sdk: AngieMcpSdk;

const LEGACY_ANGIE_WAIT_RETRY_COUNT = 3;
const LEGACY_ANGIE_WAIT_RETRY_DELAY_MS = 10_000;

class RetriableAngieSDK extends AngieMcpSdk {
	public async waitForReady(): Promise< void > {
		let retryCount = LEGACY_ANGIE_WAIT_RETRY_COUNT;
		while ( retryCount > 0 ) {
			try {
				await super.waitForReady();
				return;
			} catch {
				retryCount--;
				await sleep( LEGACY_ANGIE_WAIT_RETRY_DELAY_MS );
			}
		}
		return new Promise( () => {} );
	}
}

const sleep = ( ms: number ) =>
	new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );

export const getSDK = () => {
	// @ts-ignore - QUnit fails this
	const isMCPDisabled = !! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;
	if ( isMCPDisabled ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = isAngiePluginAvailable() ? new AngieMcpSdk() : new RetriableAngieSDK();
	}
	return sdk;
};
