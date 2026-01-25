import { AngieMcpSdk } from '@elementor-external/angie-sdk';

let sdk: AngieMcpSdk;

export const getSDK = () => {
	// @ts-ignore - QUnit fails this
	const isMCPDisabled = !! ( globalThis as Record< string, unknown > ).__ELEMENTOR_MCP_DISABLED__;
	if ( isMCPDisabled ) {
		return {} as unknown as AngieMcpSdk;
	}
	if ( ! sdk ) {
		sdk = new AngieMcpSdk();
	}
	return sdk;
};
