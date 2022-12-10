import { useContext, useEffect, useRef, useState } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';

import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function SiteName() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState, setAjax } = useAjax(),
		[ noticeState, setNoticeState ] = useState( null ),
		[ siteNameInputValue, setSiteNameInputValue ] = useState( state.siteName ),
		pageId = 'siteName',
		nextStep = 'siteLogo',
		navigate = useNavigate(),
		nameInputRef = useRef(),
		actionButton = {
			text: __( 'Next', 'elementor' ),
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					event: 'next',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );

				// Only run the site name update AJAX if the new name is different than the existing one and it isn't empty.
				if ( nameInputRef.current.value !== state.siteName && '' !== nameInputRef.current.value ) {
					setAjax( {
						data: {
							action: 'elementor_update_site_name',
							data: JSON.stringify( {
								siteName: nameInputRef.current.value,
							} ),
						},
					} );
				} else if ( nameInputRef.current.value === state.siteName ) {
					const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

					updateState( stateToUpdate );

					navigate( 'onboarding/' + nextStep );
				} else {
					const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'skipped' );

					updateState( stateToUpdate );

					navigate( 'onboarding/' + nextStep );
				}
			},
		};

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
		};
	}

	if ( ! siteNameInputValue ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	// Run the callback for the site name update AJAX request.
	useEffect( () => {
		if ( 'initial' !== ajaxState.status ) {
			if ( 'success' === ajaxState.status && ajaxState.response?.siteNameUpdated ) {
				const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

				stateToUpdate.siteName = nameInputRef.current.value;

				updateState( stateToUpdate );

				navigate( 'onboarding/' + nextStep );
			} else if ( 'error' === ajaxState.status ) {
				elementorCommon.events.dispatchEvent( {
					event: 'indication prompt',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						action_state: 'failure',
						action: 'site name update',
					},
				} );

				setNoticeState( {
					type: 'error',
					icon: 'eicon-warning',
					message: __( 'Sorry, the name wasn\'t saved. Try again, or skip for now.', 'elementor' ),
				} );
			}
		}
	}, [ ajaxState.status ] );

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<PageContentLayout
				image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Setup.svg' }
				title={ __( 'Now, let\'s give your site a name.', 'elementor' ) }
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			>
				<p>
					{ __( 'This is what your site is called on the WP dashboard, and can be changed later from the general settings - it\'s not your website\'s URL.', 'elementor' ) }
				</p>
				<input
					className="e-onboarding__text-input e-onboarding__site-name-input"
					type="text"
					placeholder="e.g. Eric's Space Shuttles"
					defaultValue={ state.siteName || '' }
					ref={ nameInputRef }
					onChange={ ( event ) => setSiteNameInputValue( event.target.value ) }
				/>
			</PageContentLayout>
		</Layout>
	);
}
