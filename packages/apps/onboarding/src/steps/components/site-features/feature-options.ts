import type * as React from 'react';

import {
	AccessibilityToolsIcon,
	AIGeneratorIcon,
	ClassesVariablesIcon,
	CookieConsentIcon,
	CorePlaceholderIcon,
	CustomCodeIcon,
	EmailDeliverabilityIcon,
	ImageOptimizationIcon,
	InteractionsIcon,
	ThemeBuilderIcon,
} from '../../../icons';

export interface FeatureOption {
	id: string;
	labelKey: string;
	Icon: React.ElementType;
	licenseType: 'core' | 'pro' | 'one';
}

export const COOKIE_CONSENT_FEATURE_ID = 'cookie_consent';

export const FEATURE_OPTIONS: FeatureOption[] = [
	{
		id: 'classes_variables',
		labelKey: 'steps.site_features.option_classes_variables',
		Icon: ClassesVariablesIcon,
		licenseType: 'core',
	},
	{
		id: 'interactions',
		labelKey: 'steps.site_features.option_interactions',
		Icon: InteractionsIcon,
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
		id: COOKIE_CONSENT_FEATURE_ID,
		labelKey: 'steps.site_features.option_cookie_consent',
		Icon: CookieConsentIcon,
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
];

export const CORE_FEATURE_IDS = new Set(
	FEATURE_OPTIONS.flatMap( ( option ) => ( option.licenseType === 'core' ? [ option.id ] : [] ) )
);
