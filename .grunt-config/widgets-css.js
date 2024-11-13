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

		// The widgets .scss files source folders.
		this.sourceScssFolder = path.resolve( __dirname, '../assets/dev/scss/frontend/widgets' );
		this.sourceModulesScssFolder = path.resolve( __dirname, '../modules' );

		// Temporary SCSS files are created and eventually transpiled into production CSS files.
		this.tempScssFolder = path.resolve( __dirname, '../assets/dev/scss/direction' );

		// The templates folder of files that are used when using custom-breakpoints.
		this.templatesCssFolder = path.resolve( __dirname, '../assets/css/templates' );

		// The destination folder of the generated widgets .css files.
		this.cssDestinationFolder = path.resolve( __dirname, '../assets/css' );
	}

	createWidgetsTempScssFiles() {
		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( item ) => {
			const widgetScssFileDest = path.join( this.tempScssFolder, item.defaultFilename ),
				widgetScssRtlFileDest = path.join( this.tempScssFolder, item.rtlFilename );

			write.sync( widgetScssFileDest, this.getWidgetScssContent( item.importPath, 'ltr' ) );
			write.sync( widgetScssRtlFileDest, this.getWidgetScssContent( item.importPath, 'rtl' ) );
		} );
	}

	getWidgetScssContent( importPath, direction ) {
		return `$direction: ${ direction };

@import "../helpers/direction";

@import "../../../../assets/dev/scss/helpers/variables";
@import "../../../../assets/dev/scss/helpers/mixins";
@import "../../../../assets/dev/scss/frontend/breakpoints/proxy";

@import "${ importPath }";
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

	getWidgetsCssFilesList() {
		if ( Array.isArray( this.widgetsScssFilesList ) ) {
			return this.widgetsScssFilesList;
		}

		this.widgetsScssFilesList = this.getStandAloneWidgetsCssFilesList().concat( this.getModulesWidgetsCssFilesList() );

		return this.widgetsScssFilesList;
	}

	getStandAloneWidgetsCssFilesList() {
		const standAloneWidgetData = [],
			standAloneWidgetsList = fs.existsSync( this.sourceScssFolder ) ? fs.readdirSync( this.sourceScssFolder ) : [];

		standAloneWidgetsList.forEach( ( filename ) => {
			const widgetName = filename.replace( '.scss', '' );

			standAloneWidgetData.push( {
				widgetName,
				defaultFilename: this.cssFilePrefix + filename,
				rtlFilename: this.cssFilePrefix + filename.replace( '.scss', '-rtl.scss' ),
				importPath: `../frontend/widgets/${ widgetName }`,
				filePath: this.sourceScssFolder + '/' + filename,
				cssFileName: `${ this.cssFilePrefix }${  filename.replace( '.scss', '' ) }`,
			} );
		} );

		return standAloneWidgetData;
	}

	getModulesWidgetsCssFilesList() {
		const moduleWidgetData = [],
			moduleWidgetsList = this.getModulesFrontendScssFiles( this.sourceModulesScssFolder );

		moduleWidgetsList.forEach( ( filePath ) => {
			const isFrontendScssFile = filePath.indexOf( 'frontend.scss' ) > -1;
			const widgetData = this.getWidgetDataFromPath( this.sourceModulesScssFolder, filePath, isFrontendScssFile );

			moduleWidgetData.push( {
				widgetName: widgetData.name,
				defaultFilename: this.cssFilePrefix + widgetData.name + '.scss',
				rtlFilename: this.cssFilePrefix + widgetData.name + '-rtl.scss',
				importPath: `../../../../modules/${  widgetData.path }`,
				filePath,
				cssFileName: `${ this.cssFilePrefix }${ widgetData.name }`,
			} );
		} );

		return moduleWidgetData;
	}

	getModulesFrontendScssFiles( filePath, frontendScssFiles = [] ) {
		fs.readdirSync( filePath ).forEach( ( fileName ) => {
			const fileFullPath = path.join( filePath, fileName );
			const isFrontendScssFile = fileName.indexOf( 'frontend.scss' ) > -1;
			const isWidgetsScssFile = fileName.indexOf( '.scss' ) > -1 && filePath.indexOf( '/widgets' ) > -1;

			if ( fs.lstatSync( fileFullPath ).isDirectory() ) {
				this.getModulesFrontendScssFiles( fileFullPath, frontendScssFiles );
			} else if ( isFrontendScssFile || isWidgetsScssFile ) {
				frontendScssFiles.push( fileFullPath );
			}
		} );

		return frontendScssFiles;
	}

	getWidgetDataFromPath( baseFolder, filePath, isFrontendScssFile = false ) {
		// Removing base-folder and first slash so that the module name will be the first value in the path.
		filePath = filePath.replace( baseFolder, '' ).substring(1);

		const getFileExtension = ( filePath ) => {
			const match = filePath.match( /\.min\.css$/ );
			return match ? '.min.css' : path.extname( filePath );
		};

		const widgetName = isFrontendScssFile
			? filePath.split( path.sep )[ 0 ]
			: path.basename( filePath, getFileExtension( filePath ) );

		return {
			path: filePath.replace( /\\/g, '/' ),
			name: widgetName,
		};
	}

	getResponsiveWidgetsList() {
		if ( Array.isArray( this.responsiveWidgets ) ) {
			return this.responsiveWidgets;
		}

		this.responsiveWidgets = [];

		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( item ) => {
			const cssFolder = path.resolve( __dirname, '../assets/css' );
			const widgetSourceFilePath = path.join( cssFolder, `${ item.cssFileName }.min.css` );
			const fileContent = fs.readFileSync( widgetSourceFilePath ).toString();

			// Collecting all widgets .scss files that has @media queries in order to create templates files for custom breakpoints.
			if ( fileContent.indexOf( '@media' ) > -1 ) {
				this.responsiveWidgets.push( item.defaultFilename, item.rtlFilename );
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
