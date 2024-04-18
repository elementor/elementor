import { useContext, useEffect, useRef, useState } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';

import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function ChooseFeatures() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState, setAjax } = useAjax(),
		tiers = { advanced: __( 'Advanced', 'elementor' ), essential: __( 'Essential', 'elementor' ) },
		[ noticeState, setNoticeState ] = useState( null ),
		[ featureWasSelected, setFeatureWasSelected ] = useState( false ),
		[ selectedFeatures, setSelectedFeatures ] = useState( { essential: [], advanced: [] } ),
		[ tierName, setTierName ] = useState( tiers.essential ),
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

	if ( ! selectedFeatures.advanced ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	useEffect( () => {
		if ( selectedFeatures.advanced.length > 0 ) {
			setTierName( tiers.advanced );
		} else {
			setTierName( tiers.essential );
		}
	}, [ selectedFeatures ] );

	function assignTierName( checked, id, text ) {
		const tier = id.split( '-' )[ 0 ];

		if ( checked ) {
			setSelectedFeatures( {
				...selectedFeatures,
				[ tier ]: [ ...selectedFeatures[ tier ], text ],
			} );
		} else {
			setSelectedFeatures( {
				...selectedFeatures,
				[ tier ]: selectedFeatures[ tier ].filter( ( item ) => item !== text ),
			} );
		}

		setFeatureWasSelected( true );
	}

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

				<form className="e-onboarding__choose-features-section">
					{
						options.map( ( option, index ) => {
							const itemId = `${ option.plan }-${ index }`;

							return (
								<label
									key={ itemId }
									className="e-onboarding__choose-features-section__label"
									htmlFor={ itemId }
								>
									<input
										className="e-onboarding__choose-features-section__checkbox"
										type="checkbox"
										onChange={ ( event ) => assignTierName( event.currentTarget.checked, event.target.value, option.text ) }
										id={ itemId }
										value={ itemId }
									/>
									{ option.text }
								</label>
							);
						} )
					}
				</form >
				{ selectedFeatures &&
					<p className="e-onboarding__choose-features-section__plan">
						{
							/* Translators: %s: Tier name. */
							__( 'Based on the features you chose, we recommend the %s plan, or higher', 'elementor' ).replace( '%s', tierName )
						}
					</p>
				}

			</PageContentLayout>
		</Layout>
	);
}
