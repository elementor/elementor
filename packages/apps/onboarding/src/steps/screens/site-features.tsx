import * as React from 'react';
import { useMemo } from 'react';
import { Stack, Typography, useTheme } from '@elementor/ui';

import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import {
	AccessibilityToolsIcon,
	AIGeneratorIcon,
	ClassesVariablesIcon,
	CorePlaceholderIcon,
	CustomCodeIcon,
	EmailDeliverabilityIcon,
	ImageOptimizationIcon,
	ThemeBuilderIcon,
	WoocommerceIcon,
} from '../../icons';
import { t } from '../../utils/translations';
import { FeatureGrid, type FeatureOption, ProPlanNotice } from '../components/site-features';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'classes_variables',
		labelKey: 'steps.site_features.option_classes_variables',
		Icon: ClassesVariablesIcon,
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
		Icon: CustomCodeIcon,
		licenseType: 'pro',
	},
	{
		id: 'email_deliverability',
		labelKey: 'steps.site_features.option_email_deliverability',
		Icon: EmailDeliverabilityIcon,
		licenseType: 'one',
	},
	{
		id: 'ai_features',
		labelKey: 'steps.site_features.option_ai_generator',
		Icon: AIGeneratorIcon,
		licenseType: 'one',
	},
	{
		id: 'image_optimization',
		labelKey: 'steps.site_features.option_image_optimization',
		Icon: ImageOptimizationIcon,
		licenseType: 'one',
	},
	{
		id: 'accessibility',
		labelKey: 'steps.site_features.option_accessibility_tools',
		Icon: AccessibilityToolsIcon,
		licenseType: 'one',
	},
	{
		id: 'woocommerce_builder',
		labelKey: 'steps.site_features.woocommerce',
		Icon: WoocommerceIcon,
		licenseType: 'pro',
	},
];

export const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.flatMap( ( option ) => ( option.licenseType === 'core' ? [ option.id ] : [] ) )
);

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

export function SiteFeatures() {
	const { choices, actions } = useOnboarding();

	const theme = useTheme();

	const storedPaidFeatures = useMemo(
		() => ( ( choices.site_features as string[] ) || [] ).filter( ( id ) => FEATURE_OPTION_IDS.has( id ) ),
		[ choices.site_features ]
	);

	const selectedValues = useMemo( () => {
		const combined = [ ...CORE_FEATURE_IDS, ...storedPaidFeatures ];
		return combined.filter( ( id, index ) => combined.indexOf( id ) === index );
	}, [ storedPaidFeatures ] );

	function handleFeatureClick( id: string ) {
		if ( CORE_FEATURE_IDS.has( id ) && selectedValues.includes( id ) ) {
			return;
		}

		const hasPaidFeaturesSelected = storedPaidFeatures.includes( id );
		const updatedPaidFeatureSelection = hasPaidFeaturesSelected
			? storedPaidFeatures.filter( ( featureId ) => featureId !== id )
			: [ ...storedPaidFeatures, id ];

		actions.setUserChoice( 'site_features', updatedPaidFeatureSelection );
	}

	const planName = useMemo( () => {
		const hasOneFeature = storedPaidFeatures.some( ( optionId ) => {
			const option = FEATURE_OPTIONS.find( ( featureOption ) => featureOption.id === optionId );
			return option?.licenseType === 'one';
		} );

		return hasOneFeature ? 'One' : 'Pro';
	}, [ storedPaidFeatures ] );

	return (
		<Stack spacing={ 4 } width="100%" data-testid="site-features-step">
			<Stack spacing={ 1 } textAlign="center" alignItems="center">
				<StepTitle color="text.primary" variant="h5" align="center" paddingBlockStart={ theme.spacing( 2.5 ) }>
					{ t( 'steps.site_features.title' ) }
				</StepTitle>
				<Typography variant="body1" color="text.secondary">
					{ t( 'steps.site_features.subtitle' ) }
				</Typography>
			</Stack>

			<FeatureGrid
				options={ FEATURE_OPTIONS }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
			/>

			{ storedPaidFeatures.length > 0 && <ProPlanNotice planName={ planName } /> }
		</Stack>
	);
}
