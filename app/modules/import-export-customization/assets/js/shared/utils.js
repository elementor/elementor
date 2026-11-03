export function isExperimentActive( experimentName ) {
	const common = typeof globalThis !== 'undefined' ? globalThis.elementorCommon : undefined;

	return !! common?.config?.experimentalFeatures?.[ experimentName ];
}

export function isAtomicElementsFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

export const IMPORT_EXPORT_CUSTOMIZATION_DEBUG_STORAGE_KEY = 'elementor:import-export-customization:debug';

export function isImportExportCustomizationDebugEnabled() {
	if ( 'undefined' === typeof globalThis ) {
		return false;
	}

	const debugFlag = globalThis.__ELEMENTOR_IMPORT_EXPORT_CUSTOMIZATION_DEBUG__;
	const storageValue = globalThis.localStorage?.getItem?.( IMPORT_EXPORT_CUSTOMIZATION_DEBUG_STORAGE_KEY );

	return true === debugFlag || '1' === storageValue || 'true' === storageValue;
}

export function getCustomizationDialogsRegistry() {
	return globalThis.elementorModules?.importExport?.customizationDialogsRegistry ?? null;
}

export function getCustomizationDialog( dialogKey ) {
	return getCustomizationDialogsRegistry()?.get?.( dialogKey ) ?? null;
}

export function getCustomizationDialogSnapshot( dialogKey ) {
	const dialog = getCustomizationDialog( dialogKey );

	if ( ! dialog ) {
		return null;
	}

	return {
		key: dialog.key,
		parentKey: dialog.parentKey,
		title: dialog.title,
		order: dialog.order,
		children: getCustomizationDialogChildren( dialogKey ).map( ( child ) => ( {
			key: child.key,
			parentKey: child.parentKey,
			title: child.title,
			order: child.order,
			settingKey: child.settingKey,
			component: child.component?.name || null,
		} ) ),
	};
}

export function getCustomizationDialogChildren( dialogKey ) {
	return getCustomizationDialogsRegistry()
		?.getAll?.()
		?.filter( ( dialog ) => dialog.parentKey === dialogKey ) ?? [];
}

export function getAvailableCustomizationDialogChildren( dialogKey ) {
	const availableChildren = getCustomizationDialogChildren( dialogKey )
		.filter( ( child ) => child.isAvailable() )
		.sort( ( first, second ) => first.order - second.order );

	return availableChildren;
}

const SITE_SETTINGS_MANIFEST_KEY = 'site-settings';
const WP_CONTENT_MANIFEST_KEY = 'wp-content';
const CUSTOM_POST_TYPE_TITLES_MANIFEST_KEY = 'custom-post-type-title';

export function getImportManifest( contextData ) {
	return contextData?.data?.uploadedData?.manifest ?? null;
}

export function getManifestItem( contextData, manifestKey ) {
	return getImportManifest( contextData )?.[ manifestKey ];
}

export function getSiteSettingsManifest( contextData ) {
	return getManifestItem( contextData, SITE_SETTINGS_MANIFEST_KEY );
}

export function isSiteSettingExported( contextData, settingKey ) {
	return !! getSiteSettingsManifest( contextData )?.[ settingKey ];
}

export function isClassesExported( contextData ) {
	return isSiteSettingExported( contextData, 'classes' );
}

export function isVariablesExported( contextData ) {
	return isSiteSettingExported( contextData, 'variables' );
}

export function isDefaultStylesExported( contextData ) {
	return isSiteSettingExported( contextData, 'defaultStyles' );
}

export function isThemeExported( contextData ) {
	if ( contextData?.isOldExport ) {
		return !! getManifestItem( contextData, 'theme' );
	}

	return isSiteSettingExported( contextData, 'theme' );
}

export function isSiteSettingsExported( contextData ) {
	const siteSettings = getSiteSettingsManifest( contextData );

	return !! siteSettings && Object.values( siteSettings ).some( Boolean );
}

export function isContentSettingsExported( contextData ) {
	return !! (
		getManifestItem( contextData, 'taxonomies' ) ||
		getManifestItem( contextData, 'content' ) ||
		getManifestItem( contextData, WP_CONTENT_MANIFEST_KEY ) ||
		getManifestItem( contextData, CUSTOM_POST_TYPE_TITLES_MANIFEST_KEY )
	);
}

export function getImportedClassesCount( contextData ) {
	return getSiteSettingsManifest( contextData )?.classesCount ?? 0;
}

export function getImportedVariablesCount( contextData ) {
	return getSiteSettingsManifest( contextData )?.variablesCount ?? 0;
}
