const path = require( 'path' );
const fs = require( 'fs' );
const write = require('write');

class WidgetsCss {
	constructor( env ) {
		this.env = env;

		// List of widgets that uses media queries.
		this.responsiveWidgets;

		// List of the widgets .scss files.
		this.widgetsScssFilesList;

		// Can't be empty.
		this.cssFilePrefix = 'widget-';

		// The widgets .scss files source folder.
		this.sourceScssFolder = path.resolve( __dirname, '../assets/dev/scss/frontend/widgets' );

		// Temporary SCSS files are created and eventually transpiled into production CSS files.
		this.tempScssFolder = path.resolve( __dirname, '../assets/dev/scss/direction' );

		// The templates folder of files that are used when using custom-breakpoints.
		this.templatesCssFolder = path.resolve( __dirname, '../assets/css/templates' );

		// The destination folder of the generated widgets .css files.
		this.cssDestinationFolder = path.resolve( __dirname, '../assets/css' );
	}

	createWidgetsTempScssFiles() {
		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( filename ) => {
			const widgetName = filename.replace( '.scss', '' ),
				{ defaultFilename, rtlFilename } = this.getCssFileNames( filename ),
				widgetScssFileDest = path.join( this.tempScssFolder, defaultFilename ),
				widgetScssRtlFileDest = path.join( this.tempScssFolder, rtlFilename );

			write.sync( widgetScssFileDest, this.getWidgetScssContent( widgetName, 'ltr' ) );
			write.sync( widgetScssRtlFileDest, this.getWidgetScssContent( widgetName, 'rtl' ) );
		} );
	}

	getWidgetScssContent( widgetName, direction ) {
		return `$direction: ${ direction };

@import "../helpers/direction";

@import "../../../../assets/dev/scss/helpers/variables";
@import "../../../../assets/dev/scss/helpers/mixins";
@import "../../../../assets/dev/scss/frontend/breakpoints/proxy";

@import "../frontend/widgets/${ widgetName }";
		`;
	}

	removeFile( filePath ) {
		fs.unlink( filePath, err => {
			if ( err ) throw err;
		} );
	}

	removeWidgetsUnusedStyleFiles() {
		const tempFilesFolders = [ this.tempScssFolder, this.cssDestinationFolder, this.templatesCssFolder ];

		tempFilesFolders.forEach( ( folder ) => {
			if ( fs.existsSync( folder ) ) {
				fs.readdirSync( folder ).forEach( ( filename ) => {
					const filePath = path.join( folder, filename );

					// In the assets/css folder we should only keep the .min.css files because the widgets CSS conditional loading is active only in production mode.
					if ( 0 === filename.indexOf( this.cssFilePrefix ) && fs.existsSync( filePath ) && -1 === filename.indexOf( '.min.css' ) ) {
						fs.unlink( filePath, err => {
							if ( err ) throw err;
						} );
					}
				} );
			}
		} );
	}

	getCssFileNames( filename ) {
		return {
			defaultFilename: this.cssFilePrefix + filename,
			rtlFilename: this.cssFilePrefix + filename.replace( '.scss', '-rtl.scss' ),
		};
	}

	getWidgetsCssFilesList() {
		if ( Array.isArray( this.widgetsScssFilesList ) ) {
			return this.widgetsScssFilesList;
		}

		this.widgetsScssFilesList = fs.existsSync( this.sourceScssFolder ) ? fs.readdirSync( this.sourceScssFolder ) : [];

		return this.widgetsScssFilesList;
	}

	getResponsiveWidgetsList() {
		if ( Array.isArray( this.responsiveWidgets ) ) {
			return this.responsiveWidgets;
		}

		this.responsiveWidgets = [];

		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( filename ) => {
			const widgetSourceFilePath = path.join( this.sourceScssFolder, filename ),
				{ defaultFilename, rtlFilename } = this.getCssFileNames( filename ),
				fileContent = fs.readFileSync( widgetSourceFilePath ).toString();

			// Collecting all widgets .scss files that has @media queries in order to create templates files for custom breakpoints.
			if ( fileContent.indexOf( '@media' ) > -1 ) {
				this.responsiveWidgets.push( defaultFilename, rtlFilename );
			}
		} );

		this.createResponsiveWidgetsJson( this.responsiveWidgets );

		return this.responsiveWidgets;
	}

	createResponsiveWidgetsJson( responsiveWidgets ) {
		const responsiveWidgetsJsonFolder = path.resolve( __dirname, '../assets/data' ),
			responsiveWidgetsJsonPath = path.join( responsiveWidgetsJsonFolder, 'responsive-widgets.json' ),
			responsiveWidgetsObject = responsiveWidgets.reduce( ( obj, val ) => {
				// No need to save also the -rtl key.
				if ( val.indexOf( '-rtl' ) > -1 ) {
					return obj;
				}

				val = val.replace( this.cssFilePrefix, '' ).replace( '.scss', '' );

				return { ...obj, [ val ]: true };
			}, {} );

		// Breaking the line for the linter that throws a warning.
		write.sync( responsiveWidgetsJsonPath, JSON.stringify( responsiveWidgetsObject ) + `
` );
	}
}

module.exports = WidgetsCss;
