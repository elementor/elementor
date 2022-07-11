import { useContext } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';

import Button from './button';

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

	// If the button is a link, no onClick functionality should be added.
	button.onClick = () => {
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
