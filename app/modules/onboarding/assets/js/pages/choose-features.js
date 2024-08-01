import { useContext, useEffect, useState } from 'react';
import useAjax from 'elementor-app/hooks/use-ajax';
import { OnboardingContext } from '../context/context';
import Message from '../components/message';
import { options, setSelectedFeatureList } from '../utils/utils';
import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function ChooseFeatures() {
	const { state } = useContext( OnboardingContext ),
		{ setAjax } = useAjax(),
		tiers = { advanced: __( 'Advanced', 'elementor' ), essential: __( 'Essential', 'elementor' ) },
		[ selectedFeatures, setSelectedFeatures ] = useState( { essential: [], advanced: [] } ),
		[ tierName, setTierName ] = useState( tiers.essential ),
		pageId = 'chooseFeatures',
		nextStep = 'goodToGo',
		actionButton = {
			text: __( 'Upgrade Now', 'elementor' ),
			href: elementorAppConfig.onboarding.urls.upgrade,
			target: '_blank',
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					event: 'next',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );

				setAjax( {
					data: {
						action: 'elementor_save_onboarding_features',
						data: JSON.stringify( {
							features: selectedFeatures,
						} ),
					},
				} );
			},
		};

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
			action: () => {
				setAjax( {
					data: {
						action: 'elementor_save_onboarding_features',
						data: JSON.stringify( {
							features: selectedFeatures,
						} ),
					},
				} );
			},
		};
	}

	if ( ! isFeatureSelected( selectedFeatures ) ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	useEffect( () => {
		if ( selectedFeatures.advanced.length > 0 ) {
			setTierName( tiers.advanced );
		} else {
			setTierName( tiers.essential );
		}
	}, [ selectedFeatures ] );

	function isFeatureSelected( features ) {
		return !! features.advanced.length || !! features.essential.length;
	}

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<PageContentLayout
				image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Setup.svg' }
				title={ __( 'Elevate your website with additional Pro features.', 'elementor' ) }
				actionButton={ actionButton }
				skipButton={ skipButton }
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
										onChange={ ( event ) => setSelectedFeatureList( { checked: event.currentTarget.checked, id: event.target.value, text: option.text, selectedFeatures, setSelectedFeatures } ) }
										id={ itemId }
										value={ itemId }
									/>
									{ option.text }
								</label>
							);
						} )
					}
				</form >
				<p className="e-onboarding__choose-features-section__message">
					{ isFeatureSelected( selectedFeatures ) &&
						<Message tier={ tierName } />
					}
				</p>

			</PageContentLayout>
		</Layout>
	);
}
