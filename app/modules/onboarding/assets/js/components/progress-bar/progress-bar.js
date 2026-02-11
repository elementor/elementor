import { useContext } from 'react';
import { OnboardingContext } from '../../context/context';
import { useNavigate } from '@reach/router';

import ProgressBarItem from './progress-bar-item';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../../utils/onboarding-event-tracking';

export default function ProgressBar() {
	const { state } = useContext( OnboardingContext ),
		navigate = useNavigate(),
		experiment202Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT202_VARIANT ),
		isExperiment201VariantB = 'B' !== experiment202Variant,
		experiment401Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT401_VARIANT ),
		isExperiment401VariantB = 'B' === experiment401Variant,
		experiment402Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT402_VARIANT ),
		isExperiment402VariantB = 'B' === experiment402Variant,
		progressBarItemsConfig = [
			{
				id: 'account',
				title: __( 'Elementor Account', 'elementor' ),
				route: 'account',
			},
		];

	// If hello theme is already activated when onboarding starts, don't show this step in the onboarding.
	if ( ! elementorAppConfig.onboarding.helloActivated ) {
		progressBarItemsConfig.push( {
			id: 'hello',
			title: isExperiment201VariantB ? __( 'Choose Theme', 'elementor' ) : __( 'Hello Biz Theme', 'elementor' ),
			route: 'hello',
		} );
	}

	if ( elementorAppConfig.onboarding.experiment ) {
		progressBarItemsConfig.push( {
			id: 'chooseFeatures',
			title: __( 'Choose Features', 'elementor' ),
			route: 'chooseFeatures',
		} );
	} else {
		progressBarItemsConfig.push( {
			id: 'siteName',
			title: __( 'Site Name', 'elementor' ),
			route: 'site-name',
		},
		{
			id: 'siteLogo',
			title: __( 'Site Logo', 'elementor' ),
			route: 'site-logo',
		} );
	}

	const goodToGoTitle = ( isExperiment401VariantB || isExperiment402VariantB ) ? __( 'Start Creating Site', 'elementor' ) : __( 'Good to Go', 'elementor' );

	progressBarItemsConfig.push(
		{
			id: 'goodToGo',
			title: goodToGoTitle,
			route: 'good-to-go',
		},
	);

	const progressBarItems = progressBarItemsConfig.map( ( itemConfig, index ) => {
		itemConfig.index = index;

		if ( state.steps[ itemConfig.id ] ) {
			itemConfig.onClick = () => {
				const currentStepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
				const nextStepNumber = OnboardingEventTracking.getStepNumber( itemConfig.id );

				if ( 4 === currentStepNumber ) {
					OnboardingEventTracking.trackStepAction( 4, 'stepper_clicks', {
						from_step: currentStepNumber,
						to_step: nextStepNumber,
					} );
					OnboardingEventTracking.sendStepEndState( 4 );
				}

				elementorCommon.events.dispatchEvent( {
					event: 'step click',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						next_step: itemConfig.id,
					},
				} );

				navigate( '/onboarding/' + itemConfig.id );
			};
		}

		return <ProgressBarItem key={ itemConfig.id } { ...itemConfig } />;
	} );

	return (
		<div className="e-onboarding__progress-bar">
			{ progressBarItems }
		</div>
	);
}
