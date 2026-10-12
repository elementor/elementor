import { BaseRegistry } from './base';
import {
	CustomPostTypesSection,
	MediaFormatSection,
} from '../components/kit-content-customization-dialog';
import { PluginListSection } from '../components/kit-plugins-customization-dialog';
import {
	DefaultStylesSettingsRow,
	GlobalClassesSettingsRow,
	GlobalVariablesSettingsRow,
	ThemeSettingsRow,
} from '../components/settings-customization-sections';

export const customizationDialogsRegistry = new BaseRegistry();

function isAtomicSettingsExperimentActive() {
	return !! globalThis.elementorCommon?.config?.experimentalFeatures?.e_atomic_elements;
}

function getSiteSettingsManifest( contextData ) {
	return contextData?.data?.uploadedData?.manifest?.[ 'site-settings' ];
}

function getThemeInitialState( { contextData, includesSettings, isImport } ) {
	if ( ! isImport ) {
		return includesSettings;
	}

	return includesSettings && !! getSiteSettingsManifest( contextData )?.theme;
}

function createSiteSettingsInitialStateResolver( manifestKey ) {
	return ( { contextData, includesSettings, isImport } ) => {
		if ( ! isImport ) {
			return includesSettings;
		}

		return includesSettings && !! getSiteSettingsManifest( contextData )?.[ manifestKey ];
	};
}

customizationDialogsRegistry.register( {
	key: 'content',
	title: 'Content',
	children: [
		{
			key: 'content/custom-post-types',
			title: 'Custom post types',
			order: 20,
			component: CustomPostTypesSection,
		},
		{
			key: 'content/media-format',
			title: 'Media format',
			order: 30,
			component: MediaFormatSection,
		},
	],
} );

customizationDialogsRegistry.register( {
	key: 'templates',
	title: 'Templates',
} );

customizationDialogsRegistry.register( {
	key: 'settings',
	title: 'Settings',
	children: [
		{
			key: 'settings/theme',
			title: 'Theme',
			order: 10,
			component: ThemeSettingsRow,
			settingKey: 'theme',
			getInitialState: getThemeInitialState,
		},
		{
			key: 'settings/global-classes',
			title: 'Classes',
			order: 20,
			component: GlobalClassesSettingsRow,
			settingKey: 'classes',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'classes' ),
		},
		{
			key: 'settings/global-variables',
			title: 'Variables',
			order: 30,
			component: GlobalVariablesSettingsRow,
			settingKey: 'variables',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'variables' ),
		},
		{
			key: 'settings/default-styles',
			title: 'Default styles',
			order: 40,
			component: DefaultStylesSettingsRow,
			settingKey: 'defaultStyles',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'defaultStyles' ),
		},
	],
} );

customizationDialogsRegistry.register( {
	key: 'plugins',
	title: 'Plugins',
	children: [
		{
			key: 'plugins/plugin-list',
			title: 'Plugin list',
			order: 10,
			component: PluginListSection,
		},
	],
} );
