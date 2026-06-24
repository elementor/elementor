import * as React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { Stack, Typography, useTheme } from '@elementor/ui';

import { StepTitle } from '../../components/ui/styled-components';
import { useOnboarding } from '../../hooks/use-onboarding';
import {
	AccessibilityToolsIcon,
	AIGeneratorIcon,
	CookieConsentIcon,
	CorePlaceholderIcon,
	CustomCodeIcon,
	EmailDeliverabilityIcon,
	HelloThemeIcon,
	ImageOptimizationIcon,
	ThemeBuilderIcon,
	WoocommerceIcon,
} from '../../icons';
import { getConfig } from '../../utils/get-config';
import { t } from '../../utils/translations';
import { FeatureGrid, type FeatureOption } from '../components/site-features';

export const HELLO_THEME_FEATURE_ID = 'hello_theme';
export const COOKIE_CONSENT_FEATURE_ID = 'cookie_consent';

export const INSTALLABLE_DEFAULTS = [ HELLO_THEME_FEATURE_ID ];

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: HELLO_THEME_FEATURE_ID,
		labelKey: 'steps.site_features.option_hello_theme',
		Icon: HelloThemeIcon,
		licenseType: 'installable',
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
		licenseType: 'installable',
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

const FEATURE_OPTION_IDS = new Set( FEATURE_OPTIONS.map( ( featureOption ) => featureOption.id ) );

const isInstallable = ( id: string ): boolean =>
	FEATURE_OPTIONS.some( ( option ) => option.id === id && option.licenseType === 'installable' );

export function SiteFeatures() {
	const { choices, actions } = useOnboarding();

	const theme = useTheme();

	const isElementorThemeActive = getConfig()?.isElementorThemeActive ?? false;

	const visibleOptions = useMemo(
		() => FEATURE_OPTIONS.filter( ( option ) => ! ( option.id === HELLO_THEME_FEATURE_ID && isElementorThemeActive ) ),
		[ isElementorThemeActive ]
	);

	const storedSiteFeatures = ( choices.site_features as string[] ) || [];
	const hasInitializedDefaults = useRef( false );

	useEffect( () => {
		if ( hasInitializedDefaults.current ) {
			return;
		}
		hasInitializedDefaults.current = true;

		const hasAnyValid = storedSiteFeatures.some( ( id ) => FEATURE_OPTION_IDS.has( id ) );

		if ( hasAnyValid ) {
			return;
		}

		const defaults = INSTALLABLE_DEFAULTS.filter(
			( id ) => ! ( id === HELLO_THEME_FEATURE_ID && isElementorThemeActive )
		);
		actions.setUserChoice( 'site_features', defaults );
	}, [ storedSiteFeatures, isElementorThemeActive, actions ] );

	const selectedValues = useMemo(
		() => storedSiteFeatures.filter( ( id ) => FEATURE_OPTION_IDS.has( id ) ),
		[ storedSiteFeatures ]
	);

	function handleFeatureClick( id: string ) {
		const next = selectedValues.includes( id )
			? selectedValues.filter( ( featureId ) => featureId !== id )
			: [ ...selectedValues, id ];

		actions.setUserChoice( 'site_features', next );
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

export { isInstallable };
