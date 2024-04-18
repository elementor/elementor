import { useContext, useEffect, useRef, useState } from 'react';
import { OnboardingContext } from '../context/context';
import Message from '../components/Message';

import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';

export default function ChooseFeatures() {
	const { state } = useContext( OnboardingContext ),
		tiers = { advanced: 'Advanced', essential: 'Essential' },
		[ selectedFeatures, setSelectedFeatures ] = useState( { essential: [], advanced: [] } ),
		[ tierName, setTierName ] = useState( tiers.essential ),
		// [ message, setMessage ] = useState( '' ),
		pageId = 'chooseFeatures',
		nextStep = 'goodToGo',
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
			href: elementorAppConfig.onboarding.urls.upgradeCTA,
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
			},
		};

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
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

		// createMessage();
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
	}

	function createMessage() {
		/* Translators: %s: Tier name. */
		const translatedMessage = __( 'Based on the features you chose, we recommend the %s plan, or higher', 'elementor' ),
			splittedMessage = translatedMessage.split( '%s' );

		setMessage( `${ splittedMessage[ 0 ] } <b> ${ tierName } </b> ${ splittedMessage[ 1 ] }` );
	}

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
				<p className="e-onboarding__choose-features-section__plan">
					{ isFeatureSelected( selectedFeatures ) &&
						// { message }
						/* Translators: %s: Tier name. */
						// __( `Based on the features you chose, we recommend the %s plan, or higher`, 'elementor' ).replace( '%s', tierName )
						<Message tier={tierName}/>
					}
				</p>

			</PageContentLayout>
		</Layout>
	);
}
