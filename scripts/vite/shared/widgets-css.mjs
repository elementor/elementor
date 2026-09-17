import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve, sep } from 'node:path';

import { ASSETS_CSS, ASSETS_DATA, resolveFromRoot } from './paths.mjs';

const CSS_FILE_PREFIX = 'widget-';
const RESPONSIVE_WIDGETS_FILE = 'responsive-widgets.json';

/**
 * Discovers per-widget SCSS sources and drives the conditional widget CSS pipeline.
 *
 * Widgets are found by scanning the SCSS trees only; PHP widget classes are never read.
 * Each widget yields a generated LTR and RTL entry file so a single partial can be
 * compiled twice with a different `$direction`.
 */
export class WidgetsCss {
	constructor( {
		sourceScssFolder = resolveFromRoot( 'assets/dev/scss/frontend/widgets' ),
		sourceModulesScssFolder = resolveFromRoot( 'modules' ),
		tempScssFolder = resolveFromRoot( 'assets/dev/scss/direction' ),
		cssDestinationFolder = ASSETS_CSS,
		templatesCssFolder = join( ASSETS_CSS, 'templates' ),
		responsiveWidgetsJsonFolder = ASSETS_DATA,
	} = {} ) {
		this.sourceScssFolder = sourceScssFolder;
		this.sourceModulesScssFolder = sourceModulesScssFolder;
		this.tempScssFolder = tempScssFolder;
		this.cssDestinationFolder = cssDestinationFolder;
		this.templatesCssFolder = templatesCssFolder;
		this.responsiveWidgetsJsonFolder = responsiveWidgetsJsonFolder;

		this.widgetsScssFilesList = null;
		this.responsiveWidgets = null;
	}

	createWidgetsTempScssFiles() {
		mkdirSync( this.tempScssFolder, { recursive: true } );

		for ( const item of this.getWidgetsCssFilesList() ) {
			writeFileSync( join( this.tempScssFolder, item.defaultFilename ), getWidgetScssContent( item.importPath, 'ltr' ) );
			writeFileSync( join( this.tempScssFolder, item.rtlFilename ), getWidgetScssContent( item.importPath, 'rtl' ) );
		}
	}

	/**
	 * Only `.min.css` widget files survive a production build, because conditional widget
	 * CSS loading is production-only. Everything else generated along the way is temporary.
	 */
	removeWidgetsUnusedStyleFiles() {
		for ( const folder of [ this.tempScssFolder, this.cssDestinationFolder, this.templatesCssFolder ] ) {
			if ( ! existsSync( folder ) ) {
				continue;
			}

			for ( const fileName of readdirSync( folder ) ) {
				if ( fileName.startsWith( CSS_FILE_PREFIX ) && ! fileName.includes( '.min.css' ) ) {
					rmSync( join( folder, fileName ), { force: true } );
				}
			}
		}
	}

	getWidgetsCssFilesList() {
		if ( ! this.widgetsScssFilesList ) {
			this.widgetsScssFilesList = [
				...this.getStandAloneWidgetsCssFilesList(),
				...this.getModulesWidgetsCssFilesList(),
			];
		}

		return this.widgetsScssFilesList;
	}

	getStandAloneWidgetsCssFilesList() {
		if ( ! existsSync( this.sourceScssFolder ) ) {
			return [];
		}

		return readdirSync( this.sourceScssFolder ).map( ( fileName ) => {
			const widgetName = fileName.replace( '.scss', '' );

			return {
				widgetName,
				defaultFilename: CSS_FILE_PREFIX + fileName,
				rtlFilename: CSS_FILE_PREFIX + fileName.replace( '.scss', '-rtl.scss' ),
				importPath: `../frontend/widgets/${ widgetName }`,
				filePath: join( this.sourceScssFolder, fileName ),
				cssFileName: CSS_FILE_PREFIX + widgetName,
			};
		} );
	}

	getModulesWidgetsCssFilesList() {
		return this.getModulesFrontendScssFiles( this.sourceModulesScssFolder ).map( ( filePath ) => {
			const isFrontendScssFile = filePath.includes( 'frontend.scss' );
			const widget = getWidgetDataFromPath( this.sourceModulesScssFolder, filePath, isFrontendScssFile );

			return {
				widgetName: widget.name,
				defaultFilename: `${ CSS_FILE_PREFIX }${ widget.name }.scss`,
				rtlFilename: `${ CSS_FILE_PREFIX }${ widget.name }-rtl.scss`,
				importPath: `../../../../modules/${ widget.path }`,
				filePath,
				cssFileName: CSS_FILE_PREFIX + widget.name,
			};
		} );
	}

	getModulesFrontendScssFiles( directory, frontendScssFiles = [] ) {
		for ( const fileName of readdirSync( directory ) ) {
			const fullPath = join( directory, fileName );

			if ( lstatSync( fullPath ).isDirectory() ) {
				this.getModulesFrontendScssFiles( fullPath, frontendScssFiles );
				continue;
			}

			const isFrontendScssFile = fileName.includes( 'frontend.scss' );
			const isWidgetsScssFile = fileName.includes( '.scss' ) && directory.includes( `${ sep }widgets` );

			if ( isFrontendScssFile || isWidgetsScssFile ) {
				frontendScssFiles.push( fullPath );
			}
		}

		return frontendScssFiles;
	}

	/**
	 * Widgets whose compiled CSS contains a media query need a second variant compiled
	 * against custom breakpoint values, served from the templates folder at runtime.
	 */
	getResponsiveWidgetsList() {
		if ( this.responsiveWidgets ) {
			return this.responsiveWidgets;
		}

		this.responsiveWidgets = [];

		for ( const item of this.getWidgetsCssFilesList() ) {
			const compiledPath = join( this.cssDestinationFolder, `${ item.cssFileName }.min.css` );

			if ( ! existsSync( compiledPath ) ) {
				throw new Error( `Missing compiled widget CSS: ${ compiledPath }` );
			}

			if ( readFileSync( compiledPath, 'utf8' ).includes( '@media' ) ) {
				this.responsiveWidgets.push( item.defaultFilename, item.rtlFilename );
			}
		}

		this.createResponsiveWidgetsJson( this.responsiveWidgets );

		return this.responsiveWidgets;
	}

	createResponsiveWidgetsJson( responsiveWidgets ) {
		const responsiveWidgetsObject = responsiveWidgets.reduce( ( widgets, fileName ) => {
			if ( fileName.includes( '-rtl' ) ) {
				return widgets;
			}

			return { ...widgets, [ fileName.replace( CSS_FILE_PREFIX, '' ).replace( '.scss', '' ) ]: true };
		}, {} );

		mkdirSync( this.responsiveWidgetsJsonFolder, { recursive: true } );
		writeFileSync(
			join( this.responsiveWidgetsJsonFolder, RESPONSIVE_WIDGETS_FILE ),
			JSON.stringify( responsiveWidgetsObject ) + '\n',
		);
	}
}

function getWidgetScssContent( importPath, direction ) {
	return `$direction: ${ direction };

@import "../../../../assets/dev/scss/helpers/variables";
@import "../../../../assets/dev/scss/helpers/mixins";
@import "../../../../assets/dev/scss/frontend/breakpoints/proxy";

@import "${ importPath }";
		`;
}

function getWidgetDataFromPath( baseFolder, filePath, isFrontendScssFile ) {
	const relativePath = resolve( filePath ).replace( resolve( baseFolder ), '' ).substring( 1 );

	return {
		path: relativePath.replace( /\\/g, '/' ),
		name: isFrontendScssFile ? relativePath.split( sep )[ 0 ] : basename( relativePath, extname( relativePath ) ),
	};
}
