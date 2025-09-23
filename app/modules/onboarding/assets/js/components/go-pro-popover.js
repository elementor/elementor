/* eslint-disable no-console */
import { OnboardingContext } from '../context/context';

import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';
import Checklist from './checklist';
import ChecklistItem from './checklist-item';
import Button from './button';
import { useCallback, useContext, useRef } from 'react';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function GoProPopover( props ) {
	const { state, updateState } = useContext( OnboardingContext );

	const trackUpgradeAction = useCallback( () => {
		const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
		OnboardingEventTracking.trackStepAction( stepNumber, 'upgrade_topbar' );
	}, [ state.currentStep ] );

	const upgradeButtonRef = useRef( null );

	const setupUpgradeButtonTracking = useCallback( ( buttonElement ) => {
		console.log( '🔗 setupUpgradeButtonTracking called:', { buttonElement: !! buttonElement, currentStep: state.currentStep } );

		if ( ! buttonElement ) {
			console.log( '❌ setupUpgradeButtonTracking: buttonElement is null/undefined' );
			return;
		}

		console.log( '🔗 Setting up popover upgrade button:', { className: buttonElement.className, href: buttonElement.href } );
		upgradeButtonRef.current = buttonElement;

		return OnboardingEventTracking.setupSingleUpgradeButtonTracking( buttonElement, state.currentStep );
	}, [ state.currentStep ] );

	// Handle the Pro Upload popup window.
	const alreadyHaveProButtonRef = useCallback( ( alreadyHaveProButton ) => {
		console.log( '🔗 alreadyHaveProButtonRef called:', { alreadyHaveProButton: !! alreadyHaveProButton, currentStep: state.currentStep } );

		if ( ! alreadyHaveProButton ) {
			console.log( '❌ alreadyHaveProButton is null/undefined' );
			return;
		}

		console.log( '🔗 Setting up Already Have Pro button:', { href: alreadyHaveProButton.href, className: alreadyHaveProButton.className } );

		// Remove any existing event listeners to prevent duplicates
		const existingHandler = alreadyHaveProButton._elementorProHandler;
		if ( existingHandler ) {
			console.log( '🧹 Removing existing Already Have Pro handler' );
			alreadyHaveProButton.removeEventListener( 'click', existingHandler );
		}

		// Create new handler
		const clickHandler = ( event ) => {
			console.log( '🔥 Already have Pro clicked:', { currentStep: state.currentStep } );
			event.preventDefault();

			trackUpgradeAction();
			OnboardingEventTracking.cancelDelayedNoClickEvent();
			const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
			console.log( '🔥 Sending already_pro_user for step:', { currentStep: state.currentStep, stepNumber } );
			OnboardingEventTracking.sendTopUpgrade( stepNumber, 'already_pro_user' );

			elementorCommon.events.dispatchEvent( {
				event: 'already have pro',
				version: '',
				details: {
					placement: elementorAppConfig.onboarding.eventPlacement,
					step: state.currentStep,
				},
			} );

			// Open the Pro Upload screen in a popup.
			window.open(
				alreadyHaveProButton.href + '&mode=popup',
				'elementorUploadPro',
				`toolbar=no, menubar=no, width=728, height=531, top=100, left=100`,
			);

			// Run the callback for when the upload succeeds.
			elementorCommon.elements.$body
				.on( 'elementor/upload-and-install-pro/success', () => {
					updateState( {
						hasPro: true,
						proNotice: {
							type: 'success',
							icon: 'eicon-check-circle-o',
							message: __( 'Elementor Pro has been successfully installed.', 'elementor' ),
						},
					} );
				} );
		};

		// Store handler reference and add event listener
		alreadyHaveProButton._elementorProHandler = clickHandler;
		alreadyHaveProButton.addEventListener( 'click', clickHandler );
		console.log( '✅ Already Have Pro event listener added' );
	}, [ state.currentStep, updateState, trackUpgradeAction ] );

	// The buttonsConfig prop is an array of objects. To find the 'Upgrade Now' button, we need to iterate over the object.
	const goProButton = props.buttonsConfig.find( ( button ) => 'go-pro' === button.id ),
		getElProButton = {
			text: elementorAppConfig.onboarding.experiment ? __( 'Upgrade now', 'elementor' ) : __( 'Upgrade Now', 'elementor' ),
			className: 'e-onboarding__go-pro-cta',
			target: '_blank',
			href: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar-dropdown&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			tabIndex: 0,
			elRef: setupUpgradeButtonTracking,
			onClick: () => {
				console.log( '🔥 Upgrade now clicked:', { currentStep: state.currentStep } );
				trackUpgradeAction();
				OnboardingEventTracking.cancelDelayedNoClickEvent();
				const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
				console.log( '🔥 Sending on_tooltip for step:', { currentStep: state.currentStep, stepNumber } );
				OnboardingEventTracking.sendTopUpgrade( stepNumber, 'on_tooltip' );

				elementorCommon.events.dispatchEvent( {
					event: 'get elementor pro',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );
			},
		};

	return (
		<PopoverDialog
			targetRef={ goProButton.elRef }
			wrapperClass="e-onboarding__go-pro"
		>
			<div className="e-onboarding__go-pro-content">
				<h2 className="e-onboarding__go-pro-title">{ __( 'Ready to Get Elementor Pro?', 'elementor' ) }</h2>
				<Checklist>
					<ChecklistItem>{ __( '90+ Basic & Pro widgets', 'elementor' ) }</ChecklistItem>
					<ChecklistItem>{ __( '300+ Basic & Pro templates', 'elementor' ) }</ChecklistItem>
					<ChecklistItem>{ __( 'Premium Support', 'elementor' ) }</ChecklistItem>
				</Checklist>
				<div className="e-onboarding__go-pro-paragraph">
					{ __( 'And so much more!', 'elementor' ) }
				</div>
				<div className="e-onboarding__go-pro-paragraph">
					<Button buttonSettings={ getElProButton } />
				</div>
				<div className="e-onboarding__go-pro-paragraph">
					<a tabIndex="0" className="e-onboarding__go-pro-already-have" ref={ alreadyHaveProButtonRef } href={ elementorAppConfig.onboarding.urls.uploadPro } rel="opener">
						{ __( 'Already have Elementor Pro?', 'elementor' ) }
					</a>
				</div>
			</div>
		</PopoverDialog>
	);
}

GoProPopover.propTypes = {
	buttonsConfig: PropTypes.array.isRequired,
};
