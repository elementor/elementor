import { OnboardingContext } from '../context/context';

import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';
import Checklist from './checklist';
import ChecklistItem from './checklist-item';
import Button from './button';
import { useCallback, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function GoProPopover( props ) {
	const { state, updateState } = useContext( OnboardingContext );

	const upgradeButtonRef = useRef( null );

	// Handle the Pro Upload popup window.
	const alreadyHaveProButtonRef = useCallback( ( alreadyHaveProButton ) => {
		if ( ! alreadyHaveProButton ) {
			return;
		}

		if ( ! state.currentStep || '' === state.currentStep ) {
			return;
		}

		const existingHandler = alreadyHaveProButton._elementorProHandler;
		if ( existingHandler ) {
			alreadyHaveProButton.removeEventListener( 'click', existingHandler );
		}

		const clickHandler = ( event ) => {
			event.preventDefault();

			if ( ! state.currentStep || '' === state.currentStep ) {
				return;
			}

			const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );
			OnboardingEventTracking.trackStepAction( stepNumber, 'upgrade_topbar' );
			OnboardingEventTracking.cancelDelayedNoClickEvent();

			if ( stepNumber ) {
				OnboardingEventTracking.sendTopUpgrade( stepNumber, 'already_pro_user' );
			}

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
							color: 'success',
							children: __( 'Pro is now active! You can continue.', 'elementor' ),
						},
					} );
				} );
		};

		alreadyHaveProButton._elementorProHandler = clickHandler;
		alreadyHaveProButton.addEventListener( 'click', clickHandler );
	}, [ state.currentStep, updateState ] );

	const getElProButton = {
		text: elementorAppConfig.onboarding.experiment ? __( 'Upgrade now', 'elementor' ) : __( 'Upgrade Now', 'elementor' ),
		className: 'e-onboarding__go-pro-cta',
		target: '_blank',
		href: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar-dropdown&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
		tabIndex: 0,
		elRef: ( buttonElement ) => {
			if ( ! buttonElement ) {
				return;
			}

			upgradeButtonRef.current = buttonElement;
		},
		onClick: () => {
			if ( ! state.currentStep || '' === state.currentStep ) {
				return;
			}

			const stepNumber = OnboardingEventTracking.getStepNumber( state.currentStep );

			OnboardingEventTracking.trackStepAction( stepNumber, 'upgrade_topbar' );
			OnboardingEventTracking.cancelDelayedNoClickEvent();

			if ( stepNumber ) {
				OnboardingEventTracking.sendTopUpgrade( stepNumber, 'on_tooltip' );
			}

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

	const targetRef = props.goProButtonRef || upgradeButtonRef;

	return (
		<PopoverDialog
			targetRef={ targetRef }
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
	goProButtonRef: PropTypes.object,
};
