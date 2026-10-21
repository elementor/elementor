import {
	CustomPostTypesSection,
	MediaFormatSection,
} from '../components/kit-content-customization-dialog';
import { PluginListSection } from '../components/kit-plugins-customization-dialog';

import {
	DesignSystemSettingsSection,
	DefaultStylesSettingsRow,
	GlobalClassesSettingsRow,
	GlobalVariablesSettingsRow,
	ThemeSettingsRow,
} from '../components/settings-customization-sections';

import {
	KIT_SECTION_ITEMS,
} from '../constants';

import {
	createCustomizationDialogsRegistry,
} from './customization-dialogs-base';

const CUSTOMIZATION_DIALOGS_READY_EVENT = 'elementor/import-export-customization/ready';
const REGISTRY_STATE_KEY = '__elementorImportExportCustomization';

const coreCustomizationDialogsBase = createCustomizationDialogsRegistry();

const UI_REGISTRATIONS = [
	{
		key: KIT_SECTION_ITEMS.CONTENT_CUSTOM_POST_TYPES,
		title: 'Custom post types',
		component: CustomPostTypesSection,
	},
	{
		key: KIT_SECTION_ITEMS.CONTENT_MEDIA_FORMAT,
		title: 'Media format',
		component: MediaFormatSection,
	},
	{
		key: KIT_SECTION_ITEMS.SETTINGS_DESIGN_SYSTEM,
		title: 'Classes, variables & default styles',
		component: DesignSystemSettingsSection,
	},
	{
		key: KIT_SECTION_ITEMS.SETTINGS_THEME,
		title: 'Theme',
		component: ThemeSettingsRow,
	},
	{
		key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_CLASSES,
		title: 'Classes',
		component: GlobalClassesSettingsRow,
	},
	{
		key: KIT_SECTION_ITEMS.SETTINGS_GLOBAL_VARIABLES,
		title: 'Variables',
		component: GlobalVariablesSettingsRow,
	},
	{
		key: KIT_SECTION_ITEMS.SETTINGS_DEFAULT_STYLES,
		title: 'Default styles',
		component: DefaultStylesSettingsRow,
	},
	{
		key: KIT_SECTION_ITEMS.PLUGINS_PLUGIN_LIST,
		title: 'Plugin list',
		component: PluginListSection,
	},
];

function createCoreUiRegistration( registration ) {
	const baseRegistration = coreCustomizationDialogsBase.get( registration.key );

	return {
		...baseRegistration,
		...registration,
		isPlaceholder: false,
	};
}

export function registerCustomizationDialogs( registry ) {
	if ( ! registry?.register ) {
		return registry;
	}

	UI_REGISTRATIONS
		.map( createCoreUiRegistration )
		.forEach( ( registration ) => registry.register( registration ) );

	const state = getRegistryState( registry );

	if ( state ) {
		state.supportsComponentOverrides = true;
	}

	return registry;
}

export function getCustomizationDialogsRegistry() {
	return globalThis.elementorModules?.importExport?.customizationDialogsRegistry ?? null;
}

function getRegistryState( registry ) {
	if ( ! registry ) {
		return null;
	}

	registry[ REGISTRY_STATE_KEY ] = registry[ REGISTRY_STATE_KEY ] || {
		hasDispatchedReadyEvent: false,
		hasRegisteredUi: false,
		isInitialized: false,
		supportsComponentOverrides: false,
	};

	return registry[ REGISTRY_STATE_KEY ];
}

export function initializeCustomizationDialogsRegistration( registry = getCustomizationDialogsRegistry() ) {
	const state = getRegistryState( registry );

	if ( ! state || state.isInitialized ) {
		return registry;
	}

	state.isInitialized = true;

	return registry;
}

export function isCustomizationDialogsUiRegistered( registry = getCustomizationDialogsRegistry() ) {
	return !! getRegistryState( registry )?.hasRegisteredUi;
}

export function createRegisteredCustomizationDialogsRegistry() {
	return registerCustomizationDialogs( createCustomizationDialogsRegistry() );
}

export function prepareCustomizationDialogsForRender( registry = getCustomizationDialogsRegistry() ) {
	const currentState = getRegistryState( registry );

	if ( ! currentState ) {
		return registry;
	}

	if ( currentState.hasRegisteredUi ) {
		return registry;
	}

	registerCustomizationDialogs( registry );

	currentState.hasRegisteredUi = true;

	if ( ! currentState.hasDispatchedReadyEvent ) {
		globalThis.dispatchEvent( new CustomEvent( CUSTOMIZATION_DIALOGS_READY_EVENT ) );
		currentState.hasDispatchedReadyEvent = true;
	}

	return registry;
}
