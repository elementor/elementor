import { getMixpanel } from '@elementor/events';
import { ONBOARDING_SITE_BUILDER_PARAMS_STORAGE_KEY } from '@elementor/utils';

import type { OnboardingChoices } from '../types';
import { buildSiteBuilderParamsFromChoices, getOnboardingExitUrl } from './get-onboarding-exit-url';
import { getOnboardingConfig } from './get-config';

export const ONBOARDING_SITE_BUILDER_PARAMS_KEY = ONBOARDING_SITE_BUILDER_PARAMS_STORAGE_KEY;
export const ONBOARDING_EXITING_TO_PLANNER_KEY = 'elementor-onboarding-exiting-to-planner';

export function storeOnboardingSiteBuilderParams( choices: OnboardingChoices ): void {
	const params = buildSiteBuilderParamsFromChoices( choices );

	if ( Object.keys( params ).length === 0 ) {
		return;
	}

	try {
		sessionStorage.setItem( ONBOARDING_SITE_BUILDER_PARAMS_KEY, JSON.stringify( params ) );
	} catch {
		// sessionStorage may be unavailable.
	}
}

export function redirectToSitePlanner( choices?: OnboardingChoices ): boolean {
	const config = getOnboardingConfig();

	if ( ! config?.shouldRedirectToSitePlanner || ! config.siteBuilderUrl ) {
		return false;
	}

	if ( choices ) {
		storeOnboardingSiteBuilderParams( choices );
	}

	try {
		sessionStorage.setItem( ONBOARDING_EXITING_TO_PLANNER_KEY, '1' );
	} catch {
		// sessionStorage may be unavailable.
	}

	const mp = getMixpanel().getMixpanelInstance?.() as
		| { request_batchers?: { events?: { flush: () => void } } }
		| undefined;
	mp?.request_batchers?.events?.flush?.();

	window.location.href = getOnboardingExitUrl( config );

	return true;
}
