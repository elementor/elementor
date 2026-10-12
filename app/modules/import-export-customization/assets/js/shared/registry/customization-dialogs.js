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
import {
	getSiteSettingsManifest,
	isThemeExported,
} from '../utils';
import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from '../constants';

export const customizationDialogsRegistry = new BaseRegistry();

function isAtomicSettingsExperimentActive() {
	return !! globalThis.elementorCommon?.config?.experimentalFeatures?.e_atomic_elements;
}

function getThemeInitialState( { contextData, includesSettings, isImport } ) {
	if ( ! isImport ) {
		return includesSettings;
	}

	return includesSettings && isThemeExported( contextData );
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
	key: KIT_SECTIONS.CONTENT,
	title: 'Content',
	children: [
		{
			key: KIT_SECTION_ITEMS.CONTENT_CUSTOM_POST_TYPES,
			title: 'Custom post types',
			order: 20,
			component: CustomPostTypesSection,
		},
		{
			key: KIT_SECTION_ITEMS.CONTENT_MEDIA_FORMAT,
			title: 'Media format',
			order: 30,
			component: MediaFormatSection,
		},
	],
} );

customizationDialogsRegistry.register( {
	key: KIT_SECTIONS.TEMPLATES,
	title: 'Templates',
} );

customizationDialogsRegistry.register( {
	key: KIT_SECTIONS.SETTINGS,
	title: 'Settings',
	children: [
		{
			key: KIT_SECTION_ITEMS.SETTINGS_THEME,
			title: 'Theme',
			order: 10,
			component: ThemeSettingsRow,
			settingKey: 'theme',
			getInitialState: getThemeInitialState,
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
			title: 'Classes',
			order: 20,
			component: GlobalClassesSettingsRow,
			settingKey: 'classes',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'classes' ),
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
			title: 'Variables',
			order: 30,
			component: GlobalVariablesSettingsRow,
			settingKey: 'variables',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'variables' ),
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
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
	key: KIT_SECTIONS.PLUGINS,
	title: 'Plugins',
	children: [
		{
			key: KIT_SECTION_ITEMS.PLUGINS_PLUGIN_LIST,
			title: 'Plugin list',
			order: 10,
			component: PluginListSection,
		},
	],
} );
