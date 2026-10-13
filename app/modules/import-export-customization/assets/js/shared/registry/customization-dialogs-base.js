import { BaseRegistry } from './base';
import {
	getSiteSettingsManifest,
	isThemeExported,
} from '../utils';
import {
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from '../constants';

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

export function createCustomizationDialogsRegistry() {
	const customizationDialogsRegistry = new BaseRegistry();

	[
		{
			key: KIT_SECTIONS.CONTENT,
			title: 'Content',
		},
		{
			key: KIT_SECTION_ITEMS.CONTENT_CUSTOM_POST_TYPES,
			parentKey: KIT_SECTIONS.CONTENT,
			title: 'Custom post types',
			order: 20,
		},
		{
			key: KIT_SECTION_ITEMS.CONTENT_MEDIA_FORMAT,
			parentKey: KIT_SECTIONS.CONTENT,
			title: 'Media format',
			order: 30,
		},
		{
			key: KIT_SECTIONS.TEMPLATES,
			title: 'Templates',
		},
		{
			key: KIT_SECTIONS.SETTINGS,
			title: 'Settings',
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_THEME,
			parentKey: KIT_SECTIONS.SETTINGS,
			title: 'Theme',
			order: 10,
			settingKey: 'theme',
			getInitialState: getThemeInitialState,
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			parentKey: KIT_SECTIONS.SETTINGS,
			title: 'Classes, variables & default styles',
			order: 20,
			isAvailable: isAtomicSettingsExperimentActive,
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
			parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			title: 'Classes',
			order: 10,
			settingKey: 'classes',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'classes' ),
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
			parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			title: 'Variables',
			order: 20,
			settingKey: 'variables',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'variables' ),
		},
		{
			key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
			parentKey: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
			title: 'Default styles',
			order: 30,
			settingKey: 'defaultStyles',
			isAvailable: isAtomicSettingsExperimentActive,
			getInitialState: createSiteSettingsInitialStateResolver( 'defaultStyles' ),
		},
		{
			key: KIT_SECTIONS.PLUGINS,
			title: 'Plugins',
		},
		{
			key: KIT_SECTION_ITEMS.PLUGINS_PLUGIN_LIST,
			parentKey: KIT_SECTIONS.PLUGINS,
			title: 'Plugin list',
			order: 10,
		},
	].forEach( ( registration ) => customizationDialogsRegistry.register( registration ) );

	return customizationDialogsRegistry;
}

export const customizationDialogsRegistry = createCustomizationDialogsRegistry();
