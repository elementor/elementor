import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Stack, Typography, useTheme } from '@elementor/ui';

import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import { useOnboardingEvent } from '../../hooks/use-onboarding-event';
import {
	AccessibilityToolsIcon,
	AIGeneratorIcon,
	ClassesVariablesIcon,
	CookieConsentIcon,
	CorePlaceholderIcon,
	CustomCodeIcon,
	EmailDeliverabilityIcon,
	HelloThemeIcon,
	ImageOptimizationIcon,
	ThemeBuilderIcon,
} from '../../icons';
import { getConfig } from '../../utils/get-config';
import { t } from '../../utils/translations';
import { FeatureGrid, type FeatureOption } from '../components/site-features';

export const HELLO_THEME_FEATURE_ID = 'hello_theme';
export const COOKIE_CONSENT_FEATURE_ID = 'cookie_consent';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'classes_variables',
		labelKey: 'steps.site_features.option_classes_variables',
		Icon: ClassesVariablesIcon,
		licenseType: 'core',
	},
	{
		id: HELLO_THEME_FEATURE_ID,
		labelKey: 'steps.site_features.option_hello_theme',
		Icon: HelloThemeIcon,
		licenseType: 'installable',
		iconSize: 24,
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
		id: COOKIE_CONSENT_FEATURE_ID,
		labelKey: 'steps.site_features.option_cookie_consent',
		Icon: CookieConsentIcon,
		licenseType: 'one',
		iconSize: 24,
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
];

export const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.flatMap( ( option ) => ( option.licenseType === 'core' ? [ option.id ] : [] ) )
);

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

export const isInstallable = ( id: string ): boolean =>
	FEATURE_OPTIONS.some( ( option ) => option.id === id && option.licenseType === 'installable' );

export function SiteFeatures() {
	const { choices, actions } = useOnboarding();
	const { trackThemeUnselected } = useOnboardingEvent();

	const theme = useTheme();

	const isHelloThemeActive = getConfig()?.isHelloThemeActive ?? false;

	const visibleOptions = useMemo(
		() => FEATURE_OPTIONS.filter( ( option ) => ! ( option.id === HELLO_THEME_FEATURE_ID && isHelloThemeActive ) ),
		[ isHelloThemeActive ]
	);

	const rawSiteFeatures = choices.site_features as string[] | undefined;

	const storedSelectableFeatures = useMemo(
		() =>
			( rawSiteFeatures || [] ).filter( ( id ) => FEATURE_OPTION_IDS.has( id ) && ! CORE_FEATURE_IDS.has( id ) ),
		[ rawSiteFeatures ]
	);

	const hasInitializedDefaults = useRef( false );

	useEffect( () => {
		if ( hasInitializedDefaults.current || isHelloThemeActive ) {
			return;
		}

		hasInitializedDefaults.current = true;

		if ( storedSelectableFeatures.length > 0 ) {
			return;
		}

		actions.setUserChoice( 'site_features', [ HELLO_THEME_FEATURE_ID ] );
	}, [ storedSelectableFeatures, isHelloThemeActive, actions ] );

	const selectedValues = useMemo( () => {
		const combined = [ ...CORE_FEATURE_IDS, ...storedSelectableFeatures ];
		return combined
			.filter( ( id, index ) => combined.indexOf( id ) === index )
			.filter( ( id ) => ! ( id === HELLO_THEME_FEATURE_ID && isHelloThemeActive ) );
	}, [ storedSelectableFeatures, isHelloThemeActive ] );

	function handleFeatureClick( id: string ) {
		if ( CORE_FEATURE_IDS.has( id ) ) {
			return;
		}

		const isCurrentlySelected = storedSelectableFeatures.includes( id );
		const updatedSelectableFeatures = isCurrentlySelected
			? storedSelectableFeatures.filter( ( featureId ) => featureId !== id )
			: [ ...storedSelectableFeatures, id ];

		if ( id === HELLO_THEME_FEATURE_ID && isCurrentlySelected ) {
			trackThemeUnselected();
		}

		actions.setUserChoice( 'site_features', updatedSelectableFeatures );
	}

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
				options={ visibleOptions }
				selectedValues={ selectedValues }
				onFeatureClick={ handleFeatureClick }
			/>
		</Stack>
	);
}
