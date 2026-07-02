import type { OnboardingChoices, OnboardingConfig } from '../types';

export function getOnboardingExitUrl(
	config: Pick< OnboardingConfig, 'shouldRedirectToSitePlanner' | 'siteBuilderUrl' | 'urls' >
): string {
	if ( config.shouldRedirectToSitePlanner && config.siteBuilderUrl ) {
		return config.siteBuilderUrl;
	}

	return config.urls.createNewPage || config.urls.editor || config.urls.dashboard;
}

export function buildSiteBuilderParamsFromChoices( choices: OnboardingChoices ): { siteType?: string } {
	const siteAbout = choices.site_about;

	if ( Array.isArray( siteAbout ) && siteAbout.length > 0 ) {
		return { siteType: siteAbout[ 0 ] };
	}

	return {};
}
