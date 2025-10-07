import { useEffect, useState } from 'react';
import Layout from '../components/layout/layout';
import GoodToGoContentA from '../components/good-to-go-content-a';
import GoodToGoContentB from '../components/good-to-go-content-b';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../utils/onboarding-event-tracking';

export default function GoodToGo() {
	const pageId = 'goodToGo';
	const [ variant, setVariant ] = useState( null );

	useEffect( () => {
		OnboardingEventTracking.checkAndSendReturnToStep4();
		OnboardingEventTracking.onStepLoad( 4 );

		const storedVariant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.GOOD_TO_GO_VARIANT );
		setVariant( storedVariant );
	}, [] );

	const ContentComponent = 'B' === variant ? GoodToGoContentB : GoodToGoContentA;
	const skipButton = 'B' === variant ? {
		text: __( 'Continue with blank canvas', 'elementor' ),
		href: elementorAppConfig.onboarding.urls.createNewPage,
	} : {
		text: __( 'Skip', 'elementor' ),
		href: elementorAppConfig.onboarding.urls.createNewPage,
	};

	return (
		<Layout pageId={ pageId }>
			<ContentComponent skipButton={ skipButton } />
		</Layout>
	);
}
