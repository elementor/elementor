import { useContext } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';

import Button from './button';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function SkipButton( props ) {
	const { button, className } = props,
		{ state, updateState } = useContext( OnboardingContext ),
		navigate = useNavigate(),
		skipStep = () => {
			const mutatedState = JSON.parse( JSON.stringify( state ) );

			mutatedState.steps[ state.currentStep ] = 'skipped';

			updateState( mutatedState );

			if ( state.nextStep ) {
				navigate( 'onboarding/' + state.nextStep );
			}
		},
		action = button.action || skipStep;

	// Make sure the 'action' prop doesn't get printed on the button markup which causes an error.
	delete button.action;

	const getStepNumber = ( stepId ) => {
		const stepMapping = {
			account: 1,
			hello: 2,
			chooseFeatures: 3,
			siteName: 4,
			siteLogo: 5,
			goodToGo: 6,
		};
		return stepMapping[ stepId ] || 1;
	};

	// If the button is a link, no onClick functionality should be added.
	button.onClick = () => {
		const stepNumber = getStepNumber( state.currentStep );

		if ( 2 === stepNumber ) {
			OnboardingEventTracking.trackStep2Action( 'skipped' );
			OnboardingEventTracking.sendStep2EndState();
		} else if ( 3 === stepNumber ) {
			OnboardingEventTracking.trackStep3Action( 'skipped' );
			OnboardingEventTracking.sendStep3EndState();
		}

		OnboardingEventTracking.sendOnboardingSkip( stepNumber );

		elementorCommon.events.dispatchEvent( {
			event: 'skip',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
			},
		} );

		if ( ! button.href ) {
			action();
		}
	};

	return <Button buttonSettings={ button } className={ className } type="skip" />;
}

SkipButton.propTypes = {
	button: PropTypes.object.isRequired,
	className: PropTypes.string,
};
