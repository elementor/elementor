import { z } from '@elementor/schema';
import { hasProInstalled, isVersionGreaterOrEqual } from '@elementor/utils';

const MIN_PRO_VERSION_FOR_MENTIONS = '4.1.0';

export const CHIP_TRIGGER_KEYS = new Set( [ ' ', ',' ] );

export function isValidEmail( email: string ): boolean {
	return z.string().email().safeParse( email ).success;
}

const FORM_FIELD_SHORTCODE_PATTERN = /^\[[^[\]]+]$/;

export function isFormFieldShortcode( value: string ): boolean {
	return FORM_FIELD_SHORTCODE_PATTERN.test( value );
}

export const shouldShowMentionsInfo = (): boolean => {
	if ( ! hasProInstalled() ) {
		return true;
	}

	const proVersion = window.elementorPro?.config?.version;

	if ( ! proVersion ) {
		return false;
	}

	return isVersionGreaterOrEqual( proVersion, MIN_PRO_VERSION_FOR_MENTIONS );
};
