export function getDefaultIllustrationUrl() {
	return elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Account.svg';
}

export function getLegacyAccountScreenConfig() {
	return elementorAppConfig.onboarding?.accountScreen ?? null;
}

export function resolveDisconnectedAccountHeadlines( accountScreen ) {
	if ( accountScreen ) {
		const showSecondLine = accountScreen.showHeadlineLine2 !== false;

		return {
			title: accountScreen.headlineLine1,
			secondLineTitle: showSecondLine ? accountScreen.headlineLine2 : '',
		};
	}

	if ( elementorAppConfig.onboarding.experiment ) {
		return {
			title: __( 'You\'re here!', 'elementor' ),
			secondLineTitle: __( 'Let\'s get connected.', 'elementor' ),
		};
	}

	return {
		title: __( 'You\'re here! Let\'s set things up.', 'elementor' ),
		secondLineTitle: '',
	};
}

export function resolveAccountScreenImage( accountScreen ) {
	if ( ! accountScreen ) {
		return getDefaultIllustrationUrl();
	}

	return getAccountScreenIllustrationUrl( accountScreen );
}

export function getAccountScreenIllustrationUrl( config ) {
	if ( ! config?.showIllustration ) {
		return null;
	}

	if ( config.illustrationUrl ) {
		return config.illustrationUrl;
	}

	return getDefaultIllustrationUrl();
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
