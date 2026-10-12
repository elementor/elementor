export function isExperimentActive( experimentName ) {
	const common = typeof globalThis !== 'undefined' ? globalThis.elementorCommon : undefined;

	return !! common?.config?.experimentalFeatures?.[ experimentName ];
}

export function isAtomicElementsFeatureActive() {
	return isExperimentActive( 'e_atomic_elements' );
}

export function isClassesFeatureActive() {
	return isAtomicElementsFeatureActive();
}

export function isVariablesFeatureActive() {
	return isAtomicElementsFeatureActive();
}

export function isDefaultStylesFeatureActive() {
	return isAtomicElementsFeatureActive();
}

export function getCustomizationDialogsRegistry() {
	return globalThis.elementorModules?.importExport?.customizationDialogsRegistry ?? null;
}

export function getCustomizationDialog( dialogKey ) {
	return getCustomizationDialogsRegistry()?.get?.( dialogKey ) ?? null;
}

export function getCustomizationDialogChildren( dialogKey ) {
	return getCustomizationDialog( dialogKey )?.children ?? [];
}

export function getAvailableCustomizationDialogChildren( dialogKey ) {
	return getCustomizationDialogChildren( dialogKey )
		.filter( ( child ) => child.isAvailable() )
		.sort( ( first, second ) => first.order - second.order );
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
	const siteSettings = getSiteSettingsManifest( contextData );

	return undefined !== siteSettings?.defaultStyles && !! siteSettings.defaultStyles;
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
