import * as React from 'react';
import { useCallback, useMemo } from 'react';
import {
	CodeIcon,
	ColorSwatchIcon,
	ElementorAccessibilityIcon,
	ElementorAIIcon,
	ElementorEmailDeliverabilityIcon,
	ElementorImageOptimizerIcon,
	ThemeBuilderIcon,
} from '@elementor/icons';
import { Stack, type Theme, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CorePlaceholderIcon } from '../../components/ui/core-placeholder-icon';
import { useOnboarding } from '../../hooks/use-onboarding';
import { FeatureGrid, type FeatureOption, ProPlanNotice } from '../components/site-features';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'classes_variables',
		label: __( 'Classes & variables', 'elementor' ),
		Icon: ( props ) => <ColorSwatchIcon { ...props } sx={ { transform: 'rotate(90deg)' } } />,
		licenseType: 'core',
	},
	{
		id: 'core_placeholder',
		label: __( 'Core Placeholder', 'elementor' ),
		Icon: CorePlaceholderIcon,
		licenseType: 'core',
	},
	{
		id: 'theme_builder',
		label: __( 'Theme Builder', 'elementor' ),
		Icon: ThemeBuilderIcon,
		licenseType: 'pro',
	},
	{
		id: 'lead_collection',
		label: __( 'Lead Collection', 'elementor' ),
		Icon: CorePlaceholderIcon,
		licenseType: 'pro',
	},
	{
		id: 'custom_code_css',
		label: __( 'Custom Code & CSS', 'elementor' ),
		Icon: CodeIcon,
		licenseType: 'pro',
	},
	{
		id: 'email_deliverability',
		label: __( 'Email deliverability', 'elementor' ),
		Icon: ElementorEmailDeliverabilityIcon,
		licenseType: 'one',
	},
	{
		id: 'ai_features',
		label: __( 'AI for code, images, & layouts', 'elementor' ),
		Icon: ElementorAIIcon,
		licenseType: 'one',
	},
	{
		id: 'image_optimization',
		label: __( 'Image optimization', 'elementor' ),
		Icon: ElementorImageOptimizerIcon,
		licenseType: 'one',
	},
	{
		id: 'accessibility',
		label: __( 'Accessibility scans and fixes', 'elementor' ),
		Icon: ElementorAccessibilityIcon,
		licenseType: 'one',
	},
];

const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.flatMap( ( option ) => ( option.licenseType === 'core' ? [ option.id ] : [] ) )
);

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

const STEP_TITLE = __( 'What do you want to include in your site?', 'elementor' );
const STEP_SUBTITLE = __( "We'll use this to tailor suggestions for you.", 'elementor' );

export function SiteFeatures() {
	const { choices, actions, urls } = useOnboarding();
	const exploreFeaturesUrl = urls.exploreFeatures;

	const storedPaidFeatures = useMemo(
		() => ( ( choices.site_features as string[] ) || [] ).filter( ( id ) => FEATURE_OPTION_IDS.has( id ) ),
		[ choices.site_features ]
	);

	const selectedValues = useMemo( () => {
		const combined = [ ...CORE_FEATURE_IDS, ...storedPaidFeatures ];
		return combined.filter( ( id, index ) => combined.indexOf( id ) === index );
	}, [ storedPaidFeatures ] );

	const handleFeatureClick = useCallback(
		( id: string ) => {
			if ( CORE_FEATURE_IDS.has( id ) && selectedValues.includes( id ) ) {
				return;
			}

			const hasPaidFeaturesSelected = storedPaidFeatures.includes( id );
			const updatedPaidFeatureSelection = hasPaidFeaturesSelected
				? storedPaidFeatures.filter( ( featureId ) => featureId !== id )
				: [ ...storedPaidFeatures, id ];

			actions.setUserChoice( 'site_features', updatedPaidFeatureSelection );
		},
		[ storedPaidFeatures, selectedValues, actions ]
	);

	const planName = useMemo( () => {
		const hasOneFeature = storedPaidFeatures.some( ( optionId ) => {
			const option = FEATURE_OPTIONS.find( ( featureOption ) => featureOption.id === optionId );
			return option?.licenseType === 'one';
		} );

		return hasOneFeature ? 'One' : 'Pro';
	}, [ storedPaidFeatures ] );

	const handleExploreMoreClick = useCallback( () => {
		window.open( exploreFeaturesUrl, '_blank' );
	}, [ exploreFeaturesUrl ] );

	return (
		<Stack
			spacing={ 4 }
			width="100%"
			marginBottom={ 10 }
			sx={ ( theme: Theme ) => ( {
				[ theme.breakpoints.down( 'sm' ) ]: {
					marginBottom: theme.spacing( 10 ),
				},
			} ) }
		>
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography variant="h5" align="center" fontWeight={ 500 }>
					{ STEP_TITLE }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ STEP_SUBTITLE }
				</Typography>
			</Stack>

			<FeatureGrid
				options={ FEATURE_OPTIONS }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
				onExploreMoreClick={ handleExploreMoreClick }
			/>

			{ storedPaidFeatures.length > 0 && <ProPlanNotice planName={ planName } /> }
		</Stack>
	);
}
