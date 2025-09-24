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

	// Handle both href and non-href skip buttons properly
	button.onClick = ( event ) => {
		const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );

		OnboardingEventTracking.trackStepAction( stepNumber, 'skipped' );
		OnboardingEventTracking.sendStepEndState( stepNumber );
		OnboardingEventTracking.sendOnboardingSkip( stepNumber );

		if ( 4 === stepNumber ) {
			OnboardingEventTracking.storeExitEventForLater( 'step4_skip_button', stepNumber );
		}

		elementorCommon.events.dispatchEvent( {
			event: 'skip',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
			},
		} );

		if ( button.href ) {
			event.preventDefault();

			setTimeout( () => {
				window.location.href = button.href;
			}, 100 );
		} else {
			action();
		}
	};

	return <Button buttonSettings={ button } className={ className } type="skip" />;
}

SkipButton.propTypes = {
	button: PropTypes.object.isRequired,
	className: PropTypes.string,
};
