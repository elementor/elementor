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

	customizationDialogsRegistry.register( {
		key: KIT_SECTIONS.CONTENT,
		title: 'Content',
		children: [
			{
				key: KIT_SECTION_ITEMS.CONTENT_CUSTOM_POST_TYPES,
				title: 'Custom post types',
				order: 20,
			},
			{
				key: KIT_SECTION_ITEMS.CONTENT_MEDIA_FORMAT,
				title: 'Media format',
				order: 30,
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
				settingKey: 'theme',
				getInitialState: getThemeInitialState,
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
				title: 'Classes',
				order: 20,
				settingKey: 'classes',
				isAvailable: isAtomicSettingsExperimentActive,
				getInitialState: createSiteSettingsInitialStateResolver( 'classes' ),
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
				title: 'Variables',
				order: 30,
				settingKey: 'variables',
				isAvailable: isAtomicSettingsExperimentActive,
				getInitialState: createSiteSettingsInitialStateResolver( 'variables' ),
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
				title: 'Default styles',
				order: 40,
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
			},
		],
	} );

	return customizationDialogsRegistry;
}

export const customizationDialogsRegistry = createCustomizationDialogsRegistry();
