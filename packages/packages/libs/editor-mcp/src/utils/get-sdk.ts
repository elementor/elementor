import { AngieMcpSdk } from '@elementor-external/angie-sdk';
export { getAngieIframe, MessageEventType } from '@elementor-external/angie-sdk';

let sdk: AngieMcpSdk;

class RetriableAngieSDK extends AngieMcpSdk {
	public async waitForReady(): Promise< void > {
		let retryCount = 3;
		while ( retryCount > 0 ) {
			try {
				await super.waitForReady();
				break;
			} catch {
				retryCount--;
				await sleep();
			}
		}
	}
}

const sleep = () =>
	new Promise( ( resolve ) => {
		setTimeout( resolve, 10_000 );
	} );

export const getSDK = () => {
	// @ts-ignore - QUnit fails this
	const isMCPDisabled = !! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;
	if ( isMCPDisabled ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = new RetriableAngieSDK();
	}
	return sdk;
};
