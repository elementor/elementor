import { OnboardingContext } from '../context/context';

import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';
import Checklist from './checklist';
import ChecklistItem from './checklist-item';
import Button from './button';
import { useCallback, useContext } from 'react';

export default function GoProPopover( props ) {
	const { state, updateState } = useContext( OnboardingContext );

	// Handle the Pro Upload popup window.
	const alreadyHaveProButtonRef = useCallback( ( alreadyHaveProButton ) => {
		if ( ! alreadyHaveProButton ) {
			return;
		}

		alreadyHaveProButton.addEventListener( 'click', ( event ) => {
			event.preventDefault();

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
		} );
	}, [] );

	// The buttonsConfig prop is an array of objects. To find the 'Upgrade Now' button, we need to iterate over the object.
	const goProButton = props.buttonsConfig.find( ( button ) => 'go-pro' === button.id ),
		getElProButton = {
			text: __( 'Upgrade Now', 'elementor' ),
			className: 'e-onboarding__go-pro-cta',
			target: '_blank',
			href: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar-dropdown&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			tabIndex: 0,
			onClick: () => {
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
