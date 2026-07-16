import { getAngieIframe, isAngiePluginAvailable, waitForAngiePluginActive } from '@elementor-external/angie-sdk';

const ANGIE_PLUGIN_DETECTION_TIMEOUT_MS = 3_000;

export const isAngieAvailable = (): boolean => isAngiePluginAvailable() || !! getAngieIframe();

export const isLegacyAngieAvailable = (): boolean => ! isAngiePluginAvailable() && !! getAngieIframe();

export const waitForAngieReady = async (): Promise< boolean > => {
	if ( isAngiePluginAvailable() ) {
		return waitForAngiePluginActive( ANGIE_PLUGIN_DETECTION_TIMEOUT_MS );
	}

	return isAngieAvailable();
};
