import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import { ASSETS_JS, resolveFromRoot } from './paths.mjs';

export const ELEMENTOR_ONE_LOCALES_PACKAGE_ROOT = resolveFromRoot(
	'node_modules/@elementor/elementor-one-assets',
);

export const ELEMENTOR_ONE_LOCALES_OUTPUT_DIRECTORY = join(
	ASSETS_JS,
	'locales',
	'elementor-one-assets',
);

export const ELEMENTOR_ONE_LOCALES_BASE_URL_PATH = 'js/locales/elementor-one-assets/';

export function copyElementorOneLocales() {
	const sourceDirectory = join( ELEMENTOR_ONE_LOCALES_PACKAGE_ROOT, 'locales' );

	rmSync( ELEMENTOR_ONE_LOCALES_OUTPUT_DIRECTORY, { recursive: true, force: true } );
	cpSync( sourceDirectory, ELEMENTOR_ONE_LOCALES_OUTPUT_DIRECTORY, { recursive: true } );
}

export function verifyElementorOneLocaleAssets() {
	const englishCommonLocale = join(
		ELEMENTOR_ONE_LOCALES_OUTPUT_DIRECTORY,
		'en',
		'common.json',
	);

	if ( ! existsSync( englishCommonLocale ) ) {
		throw new Error(
			[
				'Missing copied @elementor/elementor-one-assets locale files.',
				`Expected ${ englishCommonLocale } after the scripts build.`,
				'Run copyElementorOneLocales during build-scripts.',
			].join( '\n' ),
		);
	}
}
