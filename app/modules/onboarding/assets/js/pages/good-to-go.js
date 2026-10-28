import { useEffect } from 'react';
import Layout from '../components/layout/layout';
import GoodToGoContentA from '../components/good-to-go-content-a';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function GoodToGo() {
	const pageId = 'goodToGo';

	useEffect( () => {
		OnboardingEventTracking.checkAndSendReturnToStep4();
		OnboardingEventTracking.onStepLoad( 4 );
	}, [] );

	const skipButton = {
		text: __( 'Skip', 'elementor' ),
		href: elementorAppConfig.onboarding.urls.createNewPage,
	};

	return (
		<Layout pageId={ pageId }>
			<GoodToGoContentA skipButton={ skipButton } />
		</Layout>
	);
}
