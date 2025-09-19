import { useContext } from 'react';
import { OnboardingContext } from '../../context/context';
import { useNavigate } from '@reach/router';

import ProgressBarItem from './progress-bar-item';
import { OnboardingEventTracking } from '../../utils/onboarding-event-tracking';

export default function ProgressBar() {
	const { state } = useContext( OnboardingContext ),
		navigate = useNavigate(),

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
			title: __( 'Hello Biz Theme', 'elementor' ),
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

	progressBarItemsConfig.push(
		{
			id: 'goodToGo',
			title: __( 'Good to Go', 'elementor' ),
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
