const DEFAULT_ILLUSTRATION = elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Account.svg';

export function getLegacyAccountScreenConfig() {
	return elementorAppConfig.onboarding?.accountScreen ?? null;
}

export function getAccountScreenIllustrationUrl( config ) {
	if ( ! config?.showIllustration ) {
		return null;
	}

	if ( config.illustrationUrl ) {
		return config.illustrationUrl;
	}

	return DEFAULT_ILLUSTRATION;
}

export function buildDisconnectedPageTexts( config ) {
	if ( ! config ) {
		return null;
	}

	const listItems = config.benefits
		.map( ( text, index ) => ( config.showBenefits[ index ] ? text : null ) )
		.filter( Boolean );

	const pageTexts = {
		listItems,
	};

	if ( config.showDescription && config.description ) {
		pageTexts.firstLine = config.description;
	}

	return pageTexts;
}
