import { useContext } from 'react';
import { Context } from '../context/context';
import { useNavigate } from '@reach/router';

import Button from './button';

export default function SkipButton( props ) {
	const { button, className } = props,
		{ state, updateState } = useContext( Context ),
		navigate = useNavigate(),
		skipStep = () => {
			const mutatedState = JSON.parse( JSON.stringify( state ) );

			mutatedState.steps[ state.currentStep ] = 'skipped';

			updateState( mutatedState );

			if ( state.nextStep ) {
				navigate( 'onboarding/' + state.nextStep );
			}
		};

	// If the button is a link, no onClick functionality should be added.
	button.onClick = () => {
		elementorCommon.events.dispatchEvent( {
			placement: elementorAppConfig.onboarding.eventPlacement,
			event: 'skip',
			step: state.currentStep,
		} );

		if ( ! button.href ) {
			if ( props.action ) {
				props.action();
			} else {
				skipStep();
			}
		}
	};

	return <Button button={ button } className={ className } type="skip"/>;
}

SkipButton.propTypes = {
	button: PropTypes.object.isRequired,
	className: PropTypes.string,
	action: PropTypes.func,
};
