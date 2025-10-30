import { useEffect, useState } from 'react';
import Layout from '../components/layout/layout';
import GoodToGoContentA from '../components/good-to-go-content-a';
import GoodToGoContentB from '../components/good-to-go-content-b';
import GoodToGoContentExperiment401B from '../components/good-to-go-content-experiment401-b';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../utils/onboarding-event-tracking';

const VARIANT_B = 'B';

export default function GoodToGo() {
	const pageId = 'goodToGo';
	const [ experiment401Variant, setExperiment401Variant ] = useState( null );
	const [ experiment402Variant, setExperiment402Variant ] = useState( null );

	useEffect( () => {
		OnboardingEventTracking.checkAndSendReturnToStep4();
		OnboardingEventTracking.onStepLoad( 4 );

		const stored401Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT401_VARIANT );
		const stored402Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT402_VARIANT );
		setExperiment401Variant( stored401Variant );
		setExperiment402Variant( stored402Variant );
	}, [] );

	const getContentComponent = () => {
		if ( VARIANT_B === experiment401Variant ) {
			return GoodToGoContentExperiment401B;
		}

		if ( VARIANT_B === experiment402Variant ) {
			return GoodToGoContentB;
		}

		return GoodToGoContentA;
	};

	const getSkipButton = () => {
		if ( VARIANT_B === experiment402Variant ) {
			return {
				text: __( 'Continue with blank canvas', 'elementor' ),
				href: elementorAppConfig.onboarding.urls.createNewPage,
			};
		}

		return {
			text: __( 'Skip', 'elementor' ),
			href: elementorAppConfig.onboarding.urls.createNewPage,
		};
	};

	const getLayoutClassName = () => {
		if ( VARIANT_B === experiment401Variant ) {
			return 'experiment401-variant-b';
		}
		return '';
	};

	const ContentComponent = getContentComponent();
	const skipButton = getSkipButton();

	return (
		<Layout pageId={ pageId } className={ getLayoutClassName() }>
			<ContentComponent skipButton={ skipButton } />
		</Layout>
	);
}
