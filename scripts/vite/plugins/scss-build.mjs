import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { globSync } from 'glob';
import postcss from 'postcss';
import * as sass from 'sass';

import { BREAKPOINTS_PROXY, resolveFromRoot, ROOT } from '../shared/paths.mjs';
import { WidgetsCss } from '../shared/widgets-css.mjs';

const VIRTUAL_ENTRY_ID = 'virtual:elementor-styles';
const RESOLVED_VIRTUAL_ENTRY_ID = '\0' + VIRTUAL_ENTRY_ID;

const CSSNANO_PRESET = [ 'default', {
	reduceIdents: false,
	zindex: false,
	calc: false,
} ];

const SILENT_SASS_LOGGER = { warn() {}, debug() {} };

/**
 * Mirrors the `sass.dist` file groups. Order matters: the first group also picks up the
 * per-widget entry files generated into the direction folder before compilation starts.
 */
const SASS_TARGETS = [
	{ cwd: 'assets/dev/scss/direction', src: '*.scss', dest: 'assets/css' },
	{ cwd: 'core/editor/loader/scss', src: '*.scss', dest: 'assets/css' },
	{ cwd: 'modules/container-converter/assets/scss', src: 'editor.scss', dest: 'assets/css/modules/container-converter' },
	{ cwd: 'modules/design-system-sync/assets/scss', src: 'design-system-sync.scss', dest: 'assets/css/modules/design-system-sync' },
	{ cwd: 'modules/notes/assets/scss', src: 'editor.scss', dest: 'assets/css/modules/notes' },
	{ cwd: 'assets/dev/scss/frontend', src: 'swiper.scss', dest: 'assets/lib/swiper/css' },
	{ cwd: 'modules/announcements/assets/scss', src: 'announcements.scss', dest: 'assets/css/modules/announcements' },
	{ cwd: 'modules/styleguide/assets/scss', src: 'editor.scss', dest: 'assets/css/modules/styleguide' },
	{ cwd: 'modules/atomic-widgets/assets/scss', src: 'editor.scss', dest: 'assets/css/modules/atomic-widgets' },
	{ cwd: 'modules/atomic-opt-in/assets/scss', src: '*.scss', dest: 'assets/css/modules/editor-v4-opt-in' },
	{ cwd: 'modules/ai/assets/scss', src: '*.scss', dest: 'assets/css/modules/ai' },
	{ cwd: 'modules/apps/assets/scss', src: 'admin.scss', dest: 'assets/css/modules/apps' },
	{ cwd: 'modules/editor-one/assets/scss', src: '*.scss', dest: 'assets/css/modules/editor-one' },
	{ cwd: 'modules/home/assets/scss', src: 'e-home-screen.scss', dest: 'assets/css/modules/home' },
	{ cwd: 'modules/promotions/assets/scss', src: 'conversion-banner.scss', dest: 'assets/css/modules/promotions' },
	{ cwd: 'assets/dev/scss/frontend', src: 'admin-bar.scss', dest: 'assets/css' },
	{ cwd: 'assets/dev/scss/frontend/conditionals', src: '*.scss', dest: 'assets/css/conditionals' },
	{ cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints', src: '*.scss', dest: 'assets/css/conditionals' },
	{ cwd: 'assets/dev/scss/frontend/conditionals/with-breakpoints', src: '*.scss', dest: 'assets/css/templates' },
];

/**
 * Autoprefixer only runs over the top level stylesheets in their unminified form; nested
 * folders are prefixed exclusively as part of minification.
 */
const AUTOPREFIX_IN_PLACE_GLOBS = [ 'assets/css/*.css' ];

const MINIFY_GLOBS = [
	'assets/css/*.css',
	'assets/css/conditionals/*.css',
	'assets/css/modules/**/*.css',
	'assets/lib/swiper/css/*.css',
	'assets/css/templates/*.css',
];

const TEMPLATES_DEST = 'assets/css/templates';
const TEMPLATE_ENTRY_SOURCES = [ 'frontend.scss', 'frontend-rtl.scss' ];

function isPartial( filePath ) {
	return basename( filePath ).startsWith( '_' );
}

function collectSassJobs() {
	const jobs = [];

	for ( const target of SASS_TARGETS ) {
		const cwd = resolveFromRoot( target.cwd );

		if ( ! existsSync( cwd ) ) {
			continue;
		}

		for ( const fileName of globSync( target.src, { cwd } ).sort() ) {
			if ( isPartial( fileName ) ) {
				continue;
			}

			jobs.push( {
				sourcePath: join( cwd, fileName ),
				outputPath: resolveFromRoot( target.dest, fileName.replace( /\.scss$/, '.css' ) ),
			} );
		}
	}

	return jobs;
}

function toRelativeSourceMap( sourceMap, outputPath ) {
	const outputDir = dirname( outputPath );

	return {
		...sourceMap,
		sources: ( sourceMap.sources || [] ).map( ( source ) => {
			if ( ! source.startsWith( 'file:' ) ) {
				return source;
			}

			return relative( outputDir, fileURLToPath( source ) ).replace( /\\/g, '/' );
		} ),
	};
}

function compileSassJob( { sourcePath, outputPath }, watchFiles ) {
	const compiled = sass.compile( sourcePath, {
		style: 'expanded',
		sourceMap: true,
		// Some stylesheets import repository-root-relative paths, which the legacy Sass
		// API resolved through the working directory.
		loadPaths: [ ROOT ],
		logger: SILENT_SASS_LOGGER,
	} );

	for ( const url of compiled.loadedUrls ) {
		if ( 'file:' === url.protocol ) {
			watchFiles.add( fileURLToPath( url ) );
		}
	}

	const mapFileName = `${ basename( outputPath ) }.map`;

	mkdirSync( dirname( outputPath ), { recursive: true } );
	writeFileSync( outputPath, `${ compiled.css }\n\n/*# sourceMappingURL=${ mapFileName } */` );
	writeFileSync( `${ outputPath }.map`, JSON.stringify( toRelativeSourceMap( compiled.sourceMap, outputPath ) ) );
}

async function autoprefixInPlace( filePath ) {
	const result = await postcss( [ autoprefixer() ] ).process( readFileSync( filePath, 'utf8' ), {
		from: filePath,
		to: filePath,
		map: { inline: false, annotation: `${ basename( filePath ) }.map` },
	} );

	writeFileSync( filePath, result.css );

	if ( result.map ) {
		writeFileSync( `${ filePath }.map`, result.map.toString() );
	}
}

async function minifyToSibling( filePath ) {
	const outputPath = filePath.replace( /\.css$/, '.min.css' );
	const result = await postcss( [ autoprefixer(), cssnano( { preset: CSSNANO_PRESET } ) ] ).process(
		readFileSync( filePath, 'utf8' ),
		{ from: filePath, to: outputPath, map: false },
	);

	writeFileSync( outputPath, result.css );
}

function expandCssGlobs( patterns ) {
	return patterns
		.flatMap( ( pattern ) => globSync( pattern, { cwd: resolveFromRoot(), absolute: true } ) )
		.filter( ( filePath ) => ! filePath.endsWith( '.min.css' ) )
		.sort();
}

async function runConcurrent( items, worker, concurrency = 8 ) {
	const queue = [ ...items ];

	await Promise.all(
		Array.from( { length: Math.min( concurrency, queue.length ) }, async () => {
			while ( queue.length ) {
				await worker( queue.shift() );
			}
		} ),
	);
}

function writeBreakpointsProxy( mode ) {
	mkdirSync( dirname( BREAKPOINTS_PROXY ), { recursive: true } );
	writeFileSync( BREAKPOINTS_PROXY, `@import "${ mode }";` );
}

function compileBreakpointTemplates( widgetsCss, watchFiles ) {
	const responsiveWidgets = widgetsCss.getResponsiveWidgetsList();
	const jobs = [ ...TEMPLATE_ENTRY_SOURCES, ...responsiveWidgets ]
		.map( ( fileName ) => ( {
			sourcePath: join( widgetsCss.tempScssFolder, fileName ),
			outputPath: resolveFromRoot( TEMPLATES_DEST, fileName.replace( /\.scss$/, '.css' ) ),
		} ) )
		.filter( ( job ) => existsSync( job.sourcePath ) );

	writeBreakpointsProxy( 'templates' );

	try {
		for ( const job of jobs ) {
			compileSassJob( job, watchFiles );
		}
	} finally {
		writeBreakpointsProxy( 'values' );
	}

	return jobs.map( ( job ) => job.outputPath );
}

/**
 * Compiles every stylesheet, reproducing the task order of the legacy `grunt styles` task.
 *
 * Development mode intentionally stops after the Sass pass, matching `grunt styles:true`:
 * no widget entry generation, no autoprefixing, no minification and no cleanup.
 */
export async function compileStyles( { devMode = false } = {} ) {
	const watchFiles = new Set();
	const widgetsCss = new WidgetsCss();

	if ( ! devMode ) {
		writeBreakpointsProxy( 'values' );
		widgetsCss.createWidgetsTempScssFiles();
	}

	for ( const job of collectSassJobs() ) {
		compileSassJob( job, watchFiles );
	}

	if ( devMode ) {
		return watchFiles;
	}

	await runConcurrent( expandCssGlobs( AUTOPREFIX_IN_PLACE_GLOBS ), autoprefixInPlace );
	await runConcurrent( expandCssGlobs( MINIFY_GLOBS ), minifyToSibling );

	const templateOutputs = compileBreakpointTemplates( widgetsCss, watchFiles );
	await runConcurrent( templateOutputs, minifyToSibling );

	widgetsCss.removeWidgetsUnusedStyleFiles();

	return watchFiles;
}

export function scssBuildPlugin( { devMode = false } = {} ) {
	return {
		name: 'elementor-scss-build',
		resolveId( id ) {
			return VIRTUAL_ENTRY_ID === id ? RESOLVED_VIRTUAL_ENTRY_ID : null;
		},
		load( id ) {
			return RESOLVED_VIRTUAL_ENTRY_ID === id ? 'export {};' : null;
		},
		async buildStart() {
			const startedAt = Date.now();
			const watchFiles = await compileStyles( { devMode } );

			for ( const filePath of watchFiles ) {
				this.addWatchFile( filePath );
			}

			console.log( `[vite:styles] Compiled stylesheets in ${ Date.now() - startedAt }ms` );
		},
	};
}

export { VIRTUAL_ENTRY_ID as STYLES_VIRTUAL_ENTRY };
