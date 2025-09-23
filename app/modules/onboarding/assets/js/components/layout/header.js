/* eslint-disable no-console */
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../../context/context';
import Grid from 'elementor-app/ui/grid/grid';
import GoProPopover from '../go-pro-popover';
import HeaderButtons from 'elementor-app/layout/header-buttons';
import usePageTitle from 'elementor-app/hooks/use-page-title';
import { OnboardingEventTracking } from '../../utils/onboarding-event-tracking';

export default function Header( props ) {
	usePageTitle( { title: props.title } );

	const { state } = useContext( OnboardingContext );

	const trackXButtonExit = () => {
		const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
		console.log( '❌ trackXButtonExit called:', {
			currentStep: state.currentStep,
			stepNumber,
			resolvedStepNumber: stepNumber || state.currentStep,
		} );

		// Send exit button event
		OnboardingEventTracking.sendExitButtonEvent( stepNumber || state.currentStep );
	};

	const onClose = () => {
		console.log( '🔴 X BUTTON CLICKED - onClose triggered:', { currentStep: state.currentStep } );

		trackXButtonExit();

		console.log( '📤 Dispatching close modal event...' );
		elementorCommon.events.dispatchEvent( {
			event: 'close modal',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
			},
		} );

		console.log( '⏱️ Ensuring exit tracking completes before navigation...' );
		setTimeout( () => {
			console.log( '🔄 Redirecting to admin URL after tracking completion...' );
			window.top.location = elementorAppConfig.admin_url;
		}, 100 );
	};

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header e-onboarding__header">
			<div className="eps-app__logo-title-wrapper e-onboarding__header-logo">
				<i className="eps-app__logo eicon-elementor" />
				<img
					src={ elementorCommon.config.urls.assets + 'images/logo-platform.svg' }
					alt={ __( 'Elementor Logo', 'elementor' ) }
				/>
			</div>
			<HeaderButtons buttons={ props.buttons } onClose={ onClose } />
			{ ! state.hasPro && <GoProPopover buttonsConfig={ props.buttons } /> }
		</Grid>
	);
}

Header.propTypes = {
	title: PropTypes.string,
	buttons: PropTypes.arrayOf( PropTypes.object ),
};

Header.defaultProps = {
	buttons: [],
};
