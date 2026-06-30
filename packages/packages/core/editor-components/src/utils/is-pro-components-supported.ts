import { hasProInstalled, isProAtLeast } from '@elementor/utils';

const MIN_PRO_VERSION_FOR_COMPONENTS = '4.0';

export function isProComponentsSupported(): boolean {
	return hasProInstalled() && isProAtLeast( MIN_PRO_VERSION_FOR_COMPONENTS );
}

export function isProOutdatedForComponents(): boolean {
	return hasProInstalled() && ! isProAtLeast( MIN_PRO_VERSION_FOR_COMPONENTS );
}
