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

import { CorePlaceholderIcon } from '../../components/ui/core-placeholder-icon';
import { WoocommerceIcon } from '../../components/ui/woocommerce-icon';
import { useOnboarding } from '../../hooks/use-onboarding';
import { t } from '../../utils/translations';
import { FeatureGrid, type FeatureOption, ProPlanNotice } from '../components/site-features';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'classes_variables',
		labelKey: 'steps.site_features.option_classes_variables',
		Icon: ( props ) => <ColorSwatchIcon { ...props } sx={ { transform: 'rotate(90deg)' } } />,
		licenseType: 'core',
	},
	{
		id: 'core_placeholder',
		labelKey: 'steps.site_features.option_core_placeholder',
		Icon: CorePlaceholderIcon,
		licenseType: 'core',
	},
	{
		id: 'theme_builder',
		labelKey: 'steps.site_features.option_theme_builder',
		Icon: ThemeBuilderIcon,
		licenseType: 'pro',
	},
	{
		id: 'lead_collection',
		labelKey: 'steps.site_features.option_lead_collection',
		Icon: CorePlaceholderIcon,
		licenseType: 'pro',
	},
	{
		id: 'custom_code_css',
		labelKey: 'steps.site_features.option_custom_code',
		Icon: CodeIcon,
		licenseType: 'pro',
	},
	{
		id: 'email_deliverability',
		labelKey: 'steps.site_features.option_email_deliverability',
		Icon: ElementorEmailDeliverabilityIcon,
		licenseType: 'one',
	},
	{
		id: 'ai_features',
		labelKey: 'steps.site_features.option_ai_generator',
		Icon: ElementorAIIcon,
		licenseType: 'one',
	},
	{
		id: 'image_optimization',
		labelKey: 'steps.site_features.option_image_optimization',
		Icon: ElementorImageOptimizerIcon,
		licenseType: 'one',
	},
	{
		id: 'accessibility',
		labelKey: 'steps.site_features.option_accessibility_tools',
		Icon: ElementorAccessibilityIcon,
		licenseType: 'one',
	},
	{
		id: 'woocommerce_builder',
		labelKey: 'WooCommerce',
		Icon: WoocommerceIcon,
		licenseType: 'pro',
	},
];

const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.flatMap( ( option ) => ( option.licenseType === 'core' ? [ option.id ] : [] ) )
);

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

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
			data-testid="site-features-step"
			sx={ ( theme: Theme ) => ( {
				[ theme.breakpoints.down( 'sm' ) ]: {
					marginBottom: theme.spacing( 10 ),
				},
			} ) }
		>
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<Typography variant="h5" align="center" fontWeight={ 500 }>
					{ t( 'steps.site_features.title' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{ t( 'steps.site_features.subtitle' ) }
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
