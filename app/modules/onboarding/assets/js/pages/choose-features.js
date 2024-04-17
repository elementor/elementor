import { useContext, useEffect, useRef, useState } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';

import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function ChooseFeatures() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState, setAjax } = useAjax(),
		[ noticeState, setNoticeState ] = useState( null ),
		[ siteNameInputValue, setSiteNameInputValue ] = useState( state.siteName ),
		[ selectedFeatures, setSelectedFeatures ] = useState( [] ),
		[ featureWasSelected, setFeatureWasSelected ] = useState( false ),
		[ planName, setPlanName ] = useState( 'Essential' ),
		getPlanName = __( 'Essential', 'elementor' ),
		pageId = 'chooseFeatures',
		nextStep = 'goodToGo',
		navigate = useNavigate(),
		nameInputRef = useRef(),
		options = [
			{
				plan: 'essential',
				text: __( 'Templates & Theme Builder', 'elementor' ),
			},
			{
				plan: 'advanced',
				text: __( 'WooCommerce Builder', 'elementor' ),
			},
			{
				plan: 'essential',
				text: __( 'Lead Collection & Form Builder', 'elementor' ),
			},
			{
				plan: 'essential',
				text: __( 'Dynamic Content', 'elementor' ),
			},
			{
				plan: 'advanced',
				text: __( 'Popup Builder', 'elementor' ),
			},
			{
				plan: 'advanced',
				text: __( 'Custom Code & CSS', 'elementor' ),
			},
			{
				plan: 'essential',
				text: __( 'Motion Effects & Animations', 'elementor' ),
			},
			{
				plan: 'advanced',
				text: __( 'Notes & Collaboration', 'elementor' ),
			},
		],
		actionButton = {
			text: __( 'Upgrade Now', 'elementor' ),
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

	if ( ! siteNameInputValue || 0 === selectedFeatures.length ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	function srtPlanName () {

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

	useEffect( () => {
		setFeatureWasSelected( true );
	}, [ featureWasSelected ] );
	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<PageContentLayout
				image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Setup.svg' }
				title={ __( 'Elevate your website with additional Pro features.', 'elementor' ) }
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			>
				<p>
					{ __( 'Which Elementor Pro features do you need to bring your creative vision to life?', 'elementor' ) }
				</p>

				<div className="e-onboarding__choose-features-section">
					{
						options.map( ( option, index ) => {
							return (
								<label
									key={ option.plan + index }
									className="e-onboarding__choose-features-section__label"
								>
									<input
										className="e-onboarding__choose-features-section__checkbox"
										type="checkbox"
										placeholder="e.g. Eric's Space Shuttles"
										defaultValue={ state.siteName || '' }
										ref={ nameInputRef }
										onChange={ ( event ) => setSiteNameInputValue( event.target.value ) }
										id={ option.plan + index }
									/>
									{ option.text }
								</label>
							);
						} )
					}
				</div >
				{ featureWasSelected &&
					<p className="e-onboarding__choose-features-section__plan">
						{ __( 'Based on the features you chose, we recommend the %s plan, or higher', 'elementor' ).replace( '%s', planName ) }
					</p>
				}

			</PageContentLayout>
		</Layout>
	);
}
