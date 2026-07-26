import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss from 'postcss';

const VIRTUAL_ID = 'virtual:styles-entry';
const VIRTUAL_RESOLVED = '\0' + VIRTUAL_ID;

const CSSNANO_PRESET = [ 'default', {
	reduceIdents: false,
	zindex: false,
	calc: false,
} ];

async function compileScss( sourcePath, { sassLoadPaths, minify = false, source = null } ) {
	const sassOptions = {
		style: 'expanded',
		sourceMap: ! minify,
		loadPaths: sassLoadPaths,
		logger: { warn() {}, debug() {} },
	};

	const compiled = source === null
		? sass.compile( sourcePath, sassOptions )
		: sass.compileString( source, { ...sassOptions, url: pathToFileURL( sourcePath ), syntax: 'scss' } );

	const plugins = minify
		? [ autoprefixer(), cssnano( { preset: CSSNANO_PRESET } ) ]
		: [ autoprefixer() ];

	const result = await postcss( plugins ).process( compiled.css, {
		from: sourcePath,
		map: minify ? false : {
			inline: false,
			prev: compiled.sourceMap ? JSON.stringify( compiled.sourceMap ) : undefined,
		},
	} );

	return {
		css: result.css,
		map: result.map ? result.map.toString() : null,
		loadedUrls: compiled.loadedUrls ?? [],
	};
}

function buildRtlSource( sourcePath ) {
	return `$direction: rtl;\n${ readFileSync( sourcePath, 'utf8' ) }`;
}

function collectStandardTargets( sassTargets, resolveFromRoot, globSync ) {
	const targets = [];

	for ( const target of sassTargets ) {
		const cwd = resolveFromRoot( target.cwd );
		const files = globSync( target.src, { cwd, absolute: true } );

		for ( const sourcePath of files ) {
			const fileName = sourcePath.slice( sourcePath.lastIndexOf( '/' ) + 1 );

			if ( fileName.startsWith( '_' ) ) {
				continue;
			}

			const cssFileName = fileName.replace( '.scss', '.css' );
			const relativeDest = target.rename ? target.rename() : join( target.dest, cssFileName );

			targets.push( {
				sourcePath,
				outputRelPath: relativeDest,
				rtlVariant: target.rtl
					? {
						outputRelPath: relativeDest.replace( /\.css$/, '-rtl.css' ),
						source: buildRtlSource( sourcePath ),
					}
					: null,
			} );
		}
	}

	return targets;
}

function collectTemplateTargets( widgetsCss ) {
	const templateSources = [
		'frontend.scss',
		'frontend-rtl.scss',
		...widgetsCss.getResponsiveWidgetsList(),
	];

	return templateSources
		.map( ( sourceName ) => ( {
			sourcePath: join( widgetsCss.tempScssFolder, sourceName ),
			outputRelPath: join( 'templates', sourceName.replace( '.scss', '.css' ) ),
		} ) )
		.filter( ( target ) => existsSync( target.sourcePath ) );
}

function trackWatchDependencies( ctx, loadedUrls ) {
	for ( const url of loadedUrls ) {
		if ( url.protocol === 'file:' ) {
			ctx.addWatchFile( fileURLToPath( url ) );
		}
	}
}

function emitCssPair( ctx, { outputRelPath, dev, prod, includeSourceMap } ) {
	ctx.emitFile( { type: 'asset', fileName: outputRelPath, source: dev.css } );

	if ( includeSourceMap && dev.map ) {
		ctx.emitFile( { type: 'asset', fileName: `${ outputRelPath }.map`, source: dev.map } );
	}

	ctx.emitFile( {
		type: 'asset',
		fileName: outputRelPath.replace( /\.css$/, '.min.css' ),
		source: prod.css,
	} );
}

async function emitCompiledTarget( ctx, target, { sassLoadPaths, includeSourceMap } ) {
	const { sourcePath, outputRelPath, source = null, rtlVariant = null } = target;

	ctx.addWatchFile( sourcePath );

	const dev = await compileScss( sourcePath, { sassLoadPaths, minify: false, source } );
	const prod = await compileScss( sourcePath, { sassLoadPaths, minify: true, source } );

	trackWatchDependencies( ctx, dev.loadedUrls );

	emitCssPair( ctx, { outputRelPath, dev, prod, includeSourceMap } );

	if ( rtlVariant ) {
		const rtlDev = await compileScss( sourcePath, { sassLoadPaths, minify: false, source: rtlVariant.source } );
		const rtlProd = await compileScss( sourcePath, { sassLoadPaths, minify: true, source: rtlVariant.source } );

		emitCssPair( ctx, {
			outputRelPath: rtlVariant.outputRelPath,
			dev: rtlDev,
			prod: rtlProd,
			includeSourceMap,
		} );
	}

	return { devCss: dev.css, prodCss: prod.css };
}

function writeProxyMode( proxyShimPath, mode ) {
	writeFileSync( proxyShimPath, `@import "${ mode }";` );
}

export function scssBuildPlugin( {
	widgetsCss,
	sassTargets,
	sassLoadPaths,
	resolveFromRoot,
	proxyShimPath,
	cssDestinationFolder,
	includeSourceMap = false,
} ) {
	return {
		name: 'elementor-core-scss',
		resolveId( id ) {
			if ( id === VIRTUAL_ID ) {
				return VIRTUAL_RESOLVED;
			}
			return null;
		},
		load( id ) {
			if ( id === VIRTUAL_RESOLVED ) {
				return 'export {};';
			}
			return null;
		},
		async buildStart() {
			widgetsCss.createWidgetsTempScssFiles();

			mkdirSync( dirname( proxyShimPath ), { recursive: true } );
			writeProxyMode( proxyShimPath, 'values' );
			this.addWatchFile( proxyShimPath );

			const { globSync } = await import( 'glob' );
			const standardTargets = collectStandardTargets( sassTargets, resolveFromRoot, globSync );

			mkdirSync( cssDestinationFolder, { recursive: true } );

			for ( const target of standardTargets ) {
				const { prodCss } = await emitCompiledTarget( this, target, {
					sassLoadPaths,
					includeSourceMap,
				} );
				const minPath = join( cssDestinationFolder, target.outputRelPath.replace( /\.css$/, '.min.css' ) );
				mkdirSync( dirname( minPath ), { recursive: true } );
				writeFileSync( minPath, prodCss );
			}

			const templateTargets = collectTemplateTargets( widgetsCss );

			if ( templateTargets.length > 0 ) {
				writeProxyMode( proxyShimPath, 'templates' );

				try {
					for ( const target of templateTargets ) {
						await emitCompiledTarget( this, target, { sassLoadPaths, includeSourceMap } );
					}
				} finally {
					writeProxyMode( proxyShimPath, 'values' );
				}
			}
		},
		writeBundle() {
			widgetsCss.removeWidgetsUnusedStyleFiles();
		},
	};
}

export const STYLES_VIRTUAL_ENTRY = VIRTUAL_ID;
