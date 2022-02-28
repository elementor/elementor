import { Context } from '../context/context';

import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';
import Checklist from './checklist';
import ChecklistItem from './checklist-item';
import Button from './button';
import { useCallback, useContext } from 'react';

export default function GoProPopover( props ) {
	const { state, updateState } = useContext( Context );

	// Handle the Pro Upload popup window.
	const getProButtonRef = useCallback( ( getProButton ) => {
		if ( ! getProButton ) {
			return;
		}

		getProButton.addEventListener( 'click', ( event ) => {
			event.preventDefault();

			elementorCommon.events.dispatchEvent( {
				placement: elementorAppConfig.onboarding.eventPlacement,
				event: 'already have pro',
				step: state.currentStep,
			} );

			// Open the Pro Upload screen in a popup.
			window.open(
				jQuery( getProButton ).attr( 'href' ) + '&mode=popup',
				'elementorUploadPro',
				`toolbar=no, menubar=no, width=728, height=531, top=100, left=100`
			);

			// Run the callback for when the upload succeeds.
			elementorCommon.elements.$window
				.on( 'elementor/upload-and-install-pro/success/', () => {
					updateState( { hasPro: true } );
				} );
		} );
	}, [] );

	const goProButton = props.buttons.find( ( button ) => 'go-pro' === button.id ),
		getElProButton = {
			text: __( 'Get Elementor Pro', 'elementor' ),
			className: 'e-onboarding__go-pro-cta',
			href: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar-dropdown&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			tabIndex: 0,
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					placement: elementorAppConfig.onboarding.eventPlacement,
					event: 'get elementor pro',
					step: state.currentStep,
				} );
			},
		};

	elementorCommon.elements.$window
		.on( 'elementor/upload-and-install-pro/success/', () => {
			updateState( { hasPro: true } );
		} );

	return (
		<PopoverDialog
			targetRef={ goProButton.elRef }
			wrapperClass="e-onboarding__go-pro"
		>
			<div className="e-onboarding__go-pro-content">
				<h2 className="e-onboarding__go-pro-title">{ __( 'Ready to Go Pro?', 'elementor' ) }</h2>
				<Checklist>
					<ChecklistItem>{ __( '90+ Basic & Pro widgets', 'elementor' ) }</ChecklistItem>
					<ChecklistItem>{ __( '300+ Basic & Pro templates', 'elementor' ) }</ChecklistItem>
					<ChecklistItem>{ __( 'Premium Support', 'elementor' ) }</ChecklistItem>
				</Checklist>
				<div className="e-onboarding__go-pro-paragraph">
					{ __( 'And so much more!', 'elementor' ) }
				</div>
				<div className="e-onboarding__go-pro-paragraph">
					<Button button={ getElProButton } />
				</div>
				<div className="e-onboarding__go-pro-paragraph">
					<a tabIndex="0" className="e-onboarding__go-pro-already-have" ref={ getProButtonRef } href={ elementorAppConfig.onboarding.urls.uploadPro } rel="opener">
						{ __( 'Already have Elementor Pro?', 'elementor' ) }
					</a>
				</div>
			</div>
		</PopoverDialog>
	);
}

GoProPopover.propTypes = {
	buttons: PropTypes.array.isRequired,
};
