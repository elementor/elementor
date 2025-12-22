import { useEffect, useState, useMemo } from 'react';
import useAjax from 'elementor-app/hooks/use-ajax';
import Message from '../components/message';
import { getOptions, setSelectedFeatureList, addExperimentTrackingToUrl } from '../utils/utils';
import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';
import useButtonAction from '../utils/use-button-action';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function ChooseFeatures() {
	const isEditorOneActive = elementorAppConfig?.onboarding?.isEditorOneActive ?? false;
	const options = useMemo( () => getOptions( isEditorOneActive ), [ isEditorOneActive ] );
	const { setAjax } = useAjax(),
		tiers = {
			one: __( 'ONE', 'elementor' ),
			advanced: __( 'Advanced', 'elementor' ),
			essential: __( 'Essential', 'elementor' ),
		},
		[ selectedFeatures, setSelectedFeatures ] = useState( { one: [], essential: [], advanced: [] } ),
		[ tierName, setTierName ] = useState( tiers.essential ),
		pageId = 'chooseFeatures',
		nextStep = 'goodToGo',
		{ state, handleAction } = useButtonAction( pageId, nextStep ),
		upgradeUrl = tierName === tiers.one && elementorAppConfig.onboarding.urls.upgradeOne
			? elementorAppConfig.onboarding.urls.upgradeOne
			: elementorAppConfig.onboarding.urls.upgrade,
		actionButton = {
			text: __( 'Upgrade Now', 'elementor' ),
			href: addExperimentTrackingToUrl( upgradeUrl, 'upgrade-step3' ),
			target: '_blank',
			onClick: () => {
				OnboardingEventTracking.trackStepAction( 3, 'upgrade_now', {
					pro_features_checked: OnboardingEventTracking.extractSelectedFeatureKeys( selectedFeatures ),
				} );

				elementorCommon.events.dispatchEvent( {
					event: 'next',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );

				OnboardingEventTracking.sendUpgradeNowStep3( selectedFeatures, state.currentStep );
				OnboardingEventTracking.sendStepEndState( 3 );

				setAjax( {
					data: {
						action: 'elementor_save_onboarding_features',
						data: JSON.stringify( {
							features: selectedFeatures,
						} ),
					},
				} );

				handleAction( 'completed' );
			},
		};

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
			action: () => {
				OnboardingEventTracking.trackStepAction( 3, 'skipped' );

				setAjax( {
					data: {
						action: 'elementor_save_onboarding_features',
						data: JSON.stringify( {
							features: selectedFeatures,
						} ),
					},
				} );

				handleAction( 'skipped' );
			},
		};
	}

	if ( ! isFeatureSelected( selectedFeatures ) ) {
		actionButton.className = 'e-onboarding__button--disabled';
	}

	useEffect( () => {
		if ( isEditorOneActive && selectedFeatures.one && selectedFeatures.one.length > 0 ) {
			setTierName( tiers.one );
		} else if ( selectedFeatures.advanced && selectedFeatures.advanced.length > 0 ) {
			setTierName( tiers.advanced );
		} else if ( selectedFeatures.essential && selectedFeatures.essential.length > 0 ) {
			setTierName( tiers.essential );
		}
	}, [ selectedFeatures, isEditorOneActive, tiers.one, tiers.advanced, tiers.essential ] );

	useEffect( () => {
		OnboardingEventTracking.setupAllUpgradeButtons( state.currentStep );
		OnboardingEventTracking.onStepLoad( 3 );
	}, [ state.currentStep ] );

	function isFeatureSelected( features ) {
		return !! features.one.length || !! features.advanced.length || !! features.essential.length;
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
