#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as viteBuild, defineConfig } from 'vite-plus';

import { WidgetsCss } from '../shared/widgets-css.mjs';
import { copyLegacySwiperCssArtifacts } from './shared/legacy-artifacts.mjs';
import { scssBuildPlugin, STYLES_VIRTUAL_ENTRY } from './plugins/scss-build.mjs';
import {
	ROOT,
	VITE_CSS_OUTPUT,
	VITE_DATA_OUTPUT,
	resolveFromRoot,
} from './shared/paths.mjs';

const isWatch = process.argv.includes( '--watch' );

const SASS_LOAD_PATHS = [ ROOT ];

const SASS_TARGETS = [
	{ cwd: 'assets/dev/scss/direction', src: '*.scss', dest: '' },
	{ cwd: 'core/editor/loader/scss', src: '*.scss', dest: '' },
	{ cwd: 'modules/container-converter/assets/scss', src: 'editor.scss', dest: 'modules/container-converter' },
	{ cwd: 'modules/design-system-sync/assets/scss', src: 'design-system-sync.scss', dest: 'modules/design-system-sync' },
	{ cwd: 'modules/notes/assets/scss', src: 'editor.scss', dest: 'modules/notes' },
	{ cwd: 'assets/dev/scss/frontend', src: 'swiper.scss', dest: '../../lib/swiper/css' },
	{ cwd: 'modules/announcements/assets/scss', src: 'announcements.scss', dest: 'modules/announcements' },
	{ cwd: 'modules/styleguide/assets/scss', src: 'editor.scss', dest: 'modules/styleguide' },
	{ cwd: 'modules/atomic-widgets/assets/scss', src: 'editor.scss', dest: 'modules/atomic-widgets' },
	{ cwd: 'modules/atomic-opt-in/assets/scss', src: '*.scss', dest: 'modules/editor-v4-opt-in' },
	{ cwd: 'modules/ai/assets/scss', src: '*.scss', dest: 'modules/ai' },
	{ cwd: 'modules/apps/assets/scss', src: 'admin.scss', dest: 'modules/apps' },
	{ cwd: 'modules/editor-one/assets/scss', src: '*.scss', dest: 'modules/editor-one' },
	{ cwd: 'modules/home/assets/scss', src: 'e-home-screen.scss', dest: 'modules/home' },
	{ cwd: 'modules/promotions/assets/scss', src: 'conversion-banner.scss', dest: 'modules/promotions' },
	{ cwd: 'assets/dev/scss/frontend', src: 'admin-bar.scss', dest: '' },
	{ cwd: 'assets/dev/scss/frontend/conditionals', src: '*.scss', dest: 'conditionals' },
	{ cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints', src: '*.scss', dest: 'conditionals' },
	{ cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints', src: '*.scss', dest: 'templates' },
];

function createWidgetsCss() {
	return new WidgetsCss( {
		env: 'production',
		sourceScssFolder: resolveFromRoot( 'assets/dev/scss/frontend/widgets' ),
		sourceModulesScssFolder: resolveFromRoot( 'modules' ),
		tempScssFolder: resolveFromRoot( 'assets/dev/scss/direction' ),
		templatesCssFolder: join( VITE_CSS_OUTPUT, 'templates' ),
		cssDestinationFolder: VITE_CSS_OUTPUT,
		responsiveWidgetsJsonFolder: VITE_DATA_OUTPUT,
	} );
}

function removeVirtualEntryOutput( outputDir ) {
	if ( ! existsSync( outputDir ) ) {
		return;
	}

	for ( const fileName of readdirSync( outputDir ) ) {
		if ( fileName.startsWith( 'virtual_styles-entry' ) || fileName === 'styles-entry.js' ) {
			try {
				unlinkSync( join( outputDir, fileName ) );
			} catch ( error ) {
				// ignore cleanup failures for transient virtual entries
			}
		}
	}
}

function createStylesConfig( { watch = false } = {} ) {
	const widgetsCss = createWidgetsCss();
	const proxyShimPath = resolveFromRoot( 'assets/dev/scss/frontend/breakpoints/proxy.scss' );

	return defineConfig( {
		plugins: [
			scssBuildPlugin( {
				widgetsCss,
				sassTargets: SASS_TARGETS,
				sassLoadPaths: SASS_LOAD_PATHS,
				resolveFromRoot,
				proxyShimPath,
				cssDestinationFolder: VITE_CSS_OUTPUT,
			} ),
			{
				name: 'elementor-core-styles-cleanup',
				writeBundle() {
					removeVirtualEntryOutput( VITE_CSS_OUTPUT );
				},
			},
		],
		build: {
			outDir: VITE_CSS_OUTPUT,
			emptyOutDir: false,
			minify: false,
			target: 'es2015',
			cssMinify: false,
			sourcemap: false,
			watch: watch ? {} : null,
			rollupOptions: {
				input: { 'styles-entry': STYLES_VIRTUAL_ENTRY },
				output: {
					format: 'iife',
					entryFileNames: '[name].js',
					assetFileNames: ( info ) => info.name || '[name][extname]',
				},
			},
		},
	} );
}

export async function buildStyles() {
	if ( existsSync( VITE_CSS_OUTPUT ) ) {
		rmSync( VITE_CSS_OUTPUT, { recursive: true, force: true } );
	}

	mkdirSync( VITE_CSS_OUTPUT, { recursive: true } );
	mkdirSync( VITE_DATA_OUTPUT, { recursive: true } );

	const result = await viteBuild( createStylesConfig( { watch: isWatch } ) );

	copyLegacySwiperCssArtifacts( VITE_CSS_OUTPUT );

	if ( isWatch ) {
		console.log( '[vite:styles] Watching SCSS sources for changes. Press Ctrl+C to stop.' );

		const stop = () => {
			console.log( '\n[vite:styles] Stopping watcher...' );
			try {
				result.close?.();
			} catch ( error ) {
				console.error( '[vite:styles] Failed to close watcher:', error );
			}
			process.exit( 0 );
		};

		process.on( 'SIGINT', stop );
		process.on( 'SIGTERM', stop );
	}
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	buildStyles().catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
}
