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
	KIT_SECTIONS,
	KIT_SECTION_ITEMS,
} from '../constants';
import {
	createCustomizationDialogsRegistry,
	customizationDialogsRegistry as baseCustomizationDialogsRegistry,
} from './customization-dialogs-base';

const UI_REGISTRATIONS = [
	{
		key: KIT_SECTIONS.CONTENT,
		title: 'Content',
		children: [
			{
				key: KIT_SECTION_ITEMS.CONTENT_CUSTOM_POST_TYPES,
				component: CustomPostTypesSection,
			},
			{
				key: KIT_SECTION_ITEMS.CONTENT_MEDIA_FORMAT,
				component: MediaFormatSection,
			},
		],
	},
	{
		key: KIT_SECTIONS.SETTINGS,
		title: 'Settings',
		children: [
			{
				key: KIT_SECTION_ITEMS.SETTINGS_THEME,
				component: ThemeSettingsRow,
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
				component: GlobalClassesSettingsRow,
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
				component: GlobalVariablesSettingsRow,
			},
			{
				key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
				component: DefaultStylesSettingsRow,
			},
		],
	},
	{
		key: KIT_SECTIONS.PLUGINS,
		title: 'Plugins',
		children: [
			{
				key: KIT_SECTION_ITEMS.PLUGINS_PLUGIN_LIST,
				component: PluginListSection,
			},
		],
	},
];

function mergeRegistrationChildren( registry, registration ) {
	const existingChildren = registry?.get?.( registration.key )?.children ?? [];
	const existingChildrenMap = new Map(
		existingChildren.map( ( child ) => [ child.key, child ] ),
	);

	return registration.children?.map( ( child ) => ( {
		...existingChildrenMap.get( child.key ),
		...child,
	} ) );
}

export function registerCustomizationDialogs( registry ) {
	if ( ! registry?.register ) {
		return registry;
	}

	for ( const registration of UI_REGISTRATIONS ) {
		registry.register( {
			...registration,
			children: mergeRegistrationChildren( registry, registration ),
		} );
	}

	return registry;
}

export function getCustomizationDialogsRegistry() {
	return globalThis.elementorModules?.importExport?.customizationDialogsRegistry ?? null;
}

export function registerGlobalCustomizationDialogs() {
	return registerCustomizationDialogs( getCustomizationDialogsRegistry() );
}

export const customizationDialogsRegistry = registerCustomizationDialogs(
	createCustomizationDialogsRegistry(),
);

registerCustomizationDialogs( baseCustomizationDialogsRegistry );
