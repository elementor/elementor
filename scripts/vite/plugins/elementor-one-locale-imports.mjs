const PACKAGE_PATH_SEGMENT = 'node_modules/@elementor/elementor-one-assets';
const DYNAMIC_LOCALE_IMPORT = new RegExp(
	'import\\s*\\(\\s*`\\.\\/locales\\/\\$\\{([^}]+)\\}\\/\\$\\{([^}]+)\\}\\.json`\\s*\\)',
	'g',
);

const LOCALE_LANGUAGE_BASE_URLS = 'window.elementorOneTopBarConfig.localeLanguageBaseUrls';

/**
 * Rewrites package locale dynamic imports to fetch JSON from per-language base URLs PHP
 * enqueues for the current user language and English only (Top_Bar_Handler).
 */
export function elementorOneLocaleImportsPlugin() {
	return {
		name: 'elementor-one-locale-imports',
		enforce: 'pre',
		transform( code, id ) {
			if ( ! code.includes( './locales/${' ) ) {
				return null;
			}

			if ( ! id.split( '?' )[ 0 ].includes( PACKAGE_PATH_SEGMENT ) ) {
				return null;
			}

			if ( ! DYNAMIC_LOCALE_IMPORT.test( code ) ) {
				DYNAMIC_LOCALE_IMPORT.lastIndex = 0;

				return null;
			}

			DYNAMIC_LOCALE_IMPORT.lastIndex = 0;

			const transformed = code.replace(
				DYNAMIC_LOCALE_IMPORT,
				( _match, languageExpression, namespaceExpression ) => {
					return `fetch((${ LOCALE_LANGUAGE_BASE_URLS }[${ languageExpression }]||${ LOCALE_LANGUAGE_BASE_URLS }.en)+${ namespaceExpression }+'.json').then(function(response){if(!response.ok){throw new Error('Failed to load locale');}return response.json();})`;
				},
			);

			return { code: transformed, map: null };
		},
	};
}
