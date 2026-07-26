#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { getBannerText, prependBanner } from './shared/banner.mjs';
import {
	ROOT,
	VITE_PLUGIN_OUTPUT,
} from './shared/paths.mjs';

const EXCLUDED_SEGMENTS = new Set( [
	'.git',
	'.github',
	'.run',
	'.turbo',
	'.vscode',
	'.husky',
	'.cursor',
	'node_modules',
	'packages',
	'tests',
	'test-results',
	'tmp',
	'php-scoper',
	'assets/dev',
	'scripts',
	'bin',
	'docs',
	'local-site',
	'.vite-build',
	'.build-baseline',
	'.vite-test-vendor',
	'8888',
	'8889',
	'hello-elementor',
] );

const EXCLUDED_FILES = new Set( [
	'.gitignore',
	'.gitmodules',
	'.jscsrc',
	'.dockerignore',
	'karma.conf.js',
	'phpcs.xml',
	'tsconfig.json',
	'composer.json',
	'composer.lock',
	'docker-compose.yml',
	'Gruntfile.js',
	'nightwatch.conf.js',
	'package-lock.json',
	'package.json',
	'phpunit.xml',
	'ruleset.xml',
	'yarn.lock',
	'commitlint.config.js',
	'run-on-linux.js',
	'Dockerfile',
	'.DS_Store',
	'.browserslistrc',
	'.editorconfig',
	'.env',
	'.env.example',
	'.eslintignore',
	'.eslintrc.js',
	'.gitattributes',
	'.nvmrc',
	'.wp-env.json',
	'.prettierrc',
	'.lighthouserc.js',
	'.cursorignore',
	'.claudeignore',
	'eslint-local-rules.js',
	'query.sql',
	'vite.config.ts',
] );

const ALLOWED_VENDOR_PREFIXES = [
	'vendor/autoload.php',
	'vendor/autoload_packages.php',
	'vendor/composer',
	'vendor/elementor/wp-one-package',
	'vendor/elementor/wp-notifications-package',
	'vendor/jetpack-autoloader',
	'vendor/wordpress',
];

function isAllowedVendorPath( relativePath ) {
	return ALLOWED_VENDOR_PREFIXES.some( ( prefix ) =>
		relativePath === prefix
		|| relativePath.startsWith( `${ prefix }/` )
		|| prefix.startsWith( `${ relativePath }/` ),
	);
}

function shouldExcludePath( relativePath ) {
	if ( ! relativePath || relativePath === '.' ) {
		return true;
	}

	const segments = relativePath.split( '/' ).filter( Boolean );
	const baseName = segments[ segments.length - 1 ];

	if ( 'AGENTS.md' === relativePath || 'README.md' === relativePath || 'CHANGELOG.md' === relativePath ) {
		return true;
	}

	if ( EXCLUDED_FILES.has( baseName ) && ! ( isAllowedVendorPath( relativePath ) && '.gitignore' !== baseName ) ) {
		return true;
	}

	if ( baseName.endsWith( '~' ) ) {
		return true;
	}

	if ( segments[ 0 ] === 'build' ) {
		return true;
	}

	if ( segments.some( ( segment ) => EXCLUDED_SEGMENTS.has( segment ) ) ) {
		return true;
	}

	if ( relativePath.startsWith( 'assets/js/qunit-tests' ) ) {
		return true;
	}

	if ( relativePath.startsWith( 'app/' ) && relativePath.includes( '/assets/' ) ) {
		return true;
	}

	if (
		relativePath.startsWith( 'core/' )
		&& relativePath.includes( '/assets/' )
		&& ! relativePath.startsWith( 'core/files/assets/' )
	) {
		return true;
	}

	if ( relativePath.startsWith( 'modules/' ) && relativePath.includes( '/assets/js/' ) ) {
		return true;
	}

	if ( relativePath.startsWith( 'modules/' ) && relativePath.includes( '/assets/scss/' ) ) {
		return true;
	}

	if ( relativePath.endsWith( '.scss' ) && relativePath.includes( '/assets/scss/' ) && relativePath.startsWith( 'core/' ) ) {
		return true;
	}

	if ( relativePath.startsWith( 'assets/dev/' ) ) {
		return true;
	}

	if ( relativePath.startsWith( 'assets/' ) && relativePath.endsWith( '.map' ) ) {
		return true;
	}

	if ( segments[ 0 ] === 'vendor' && segments.length === 1 ) {
		return false;
	}

	if ( relativePath.startsWith( 'vendor/' ) ) {
		return ! isAllowedVendorPath( relativePath );
	}

	return false;
}

function copyTree( sourceDir, destinationDir, relativePath = '' ) {
	for ( const entry of readdirSync( sourceDir, { withFileTypes: true } ) ) {
		const entryRelativePath = join( relativePath, entry.name ).replace( /\\/g, '/' );

		if ( shouldExcludePath( entryRelativePath ) ) {
			continue;
		}

		const sourcePath = join( sourceDir, entry.name );
		const destinationPath = join( destinationDir, entry.name );

		if ( entry.isDirectory() ) {
			mkdirSync( destinationPath, { recursive: true } );
			copyTree( sourcePath, destinationPath, entryRelativePath );
			continue;
		}

		mkdirSync( dirname( destinationPath ), { recursive: true } );
		cpSync( sourcePath, destinationPath );
	}
}

function walkFiles( directory, files = [] ) {
	if ( ! existsSync( directory ) ) {
		return files;
	}

	for ( const entry of readdirSync( directory, { withFileTypes: true } ) ) {
		const fullPath = join( directory, entry.name );

		if ( entry.isDirectory() ) {
			walkFiles( fullPath, files );
			continue;
		}

		files.push( fullPath );
	}

	return files;
}

export function applyBannerToAssets( directory ) {
	if ( ! existsSync( directory ) ) {
		return;
	}

	const banner = getBannerText();

	for ( const filePath of walkFiles( directory ) ) {
		if ( ! filePath.endsWith( '.js' ) && ! filePath.endsWith( '.css' ) ) {
			continue;
		}

		const isTopLevelCss = filePath.includes( '/assets/css/' ) && ! filePath.includes( '/assets/css/modules/' ) && ! filePath.includes( '/assets/css/conditionals/' ) && ! filePath.includes( '/assets/css/templates/' );
		const isTopLevelJs = filePath.includes( '/assets/js/' ) && filePath.match( /\/assets\/js\/[^/]+\.js$/ );

		if ( ! isTopLevelCss && ! isTopLevelJs ) {
			continue;
		}

		const content = readFileSync( filePath, 'utf8' );
		writeFileSync( filePath, prependBanner( content, banner ) );
	}
}

export async function assemblePlugin() {
	if ( existsSync( VITE_PLUGIN_OUTPUT ) ) {
		rmSync( VITE_PLUGIN_OUTPUT, { recursive: true, force: true } );
	}

	mkdirSync( VITE_PLUGIN_OUTPUT, { recursive: true } );
	copyTree( ROOT, VITE_PLUGIN_OUTPUT );
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	assemblePlugin().catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
