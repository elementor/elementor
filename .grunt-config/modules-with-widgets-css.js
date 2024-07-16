const path = require( 'path' );
const fs = require( 'fs' );

class ModulesWithWidgetsCss {
	constructor( env ) {
		this.env = env;

		// List of widgets that uses media queries.
		this.responsiveWidgets;

		// List of the widgets .scss files.
		this.widgetsScssFilesList;

		// Can't be empty.
		this.cssFilePrefix = 'widget-';

		// The widgets .scss files source folder.
		this.sourceScssFolder = path.resolve( __dirname, '../modules' );

		// Temporary SCSS files are created and eventually transpiled into production CSS files.
		this.tempScssFolder = path.resolve( __dirname, '../assets/dev/scss/direction' );

		// The templates folder of files that are used when using custom-breakpoints.
		this.templatesCssFolder = path.resolve( __dirname, '../assets/css/templates' );

		// The destination folder of the generated widgets .css files.
		this.cssDestinationFolder = path.resolve( __dirname, '../assets/css' );
	}

	getModulesFrontendScssFiles( filePath, frontendScssFiles = [] ) {
		fs.readdirSync( filePath ).forEach( ( fileName ) => {
			const fileFullPath = path.join( filePath, fileName );

			if ( fs.lstatSync( fileFullPath ).isDirectory() ) {
				this.getModulesFrontendScssFiles( fileFullPath, frontendScssFiles );
			} else if ( fileName.indexOf( 'frontend.scss' ) > -1 ) {
				frontendScssFiles.push( fileFullPath );
			}
		} );

		return frontendScssFiles;
	}

	getWidgetDataFromPath( baseFolder, filePath ) {
		// Removing base-folder and first slash so that the module name will be the first value in the path.
		filePath = filePath.replace( baseFolder, '' ).substring(1);

		return {
			path: filePath.replace( /\\/g, '/' ),
			name: filePath.split( path.sep )[ 0 ],
		};
	}

	createWidgetsTempScssFiles() {
		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( filePath ) => {
			const widgetData = this.getWidgetDataFromPath( this.sourceScssFolder, filePath ),
				widgetName = widgetData.name,
				{ defaultFilename, rtlFilename } = this.getCssFileNames( widgetName ),
				widgetScssFileDest = path.join( this.tempScssFolder, defaultFilename ),
				widgetScssRtlFileDest = path.join( this.tempScssFolder, rtlFilename );

			fs.writeFileSync(widgetScssFileDest, this.getWidgetScssContent( widgetName, 'ltr', widgetData.path ) );
			fs.writeFileSync(widgetScssRtlFileDest, this.getWidgetScssContent( widgetName, 'rtl', widgetData.path ) );
		} );
	}

	getWidgetScssContent( widgetName, direction, widgetPath ) {
		return `$direction: ${ direction };

@import "../../../../../elementor/assets/dev/scss/helpers/direction";
@import "../../../../../elementor/assets/dev/scss/helpers/variables";
@import "../../../../../elementor/assets/dev/scss/frontend/breakpoints/breakpoints";
@import "../../../../../elementor/assets/dev/scss/helpers/mixins";

@import "../../../../modules/${ widgetPath }";
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
			defaultFilename: this.cssFilePrefix + filename + '.scss',
			rtlFilename: this.cssFilePrefix + filename + '-rtl.scss',
		};
	}

	getWidgetsCssFilesList() {
		if ( Array.isArray( this.widgetsScssFilesList ) ) {
			return this.widgetsScssFilesList;
		}

		this.widgetsScssFilesList = this.getModulesFrontendScssFiles( this.sourceScssFolder );

		return this.widgetsScssFilesList;
	}

	getResponsiveWidgetsList() {
		if ( Array.isArray( this.responsiveWidgets ) ) {
			return this.responsiveWidgets;
		}

		this.responsiveWidgets = [];

		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( filePath ) => {
			const widgetData = this.getWidgetDataFromPath( this.sourceScssFolder, filePath ),
				widgetName = widgetData.name,
				{ defaultFilename, rtlFilename } = this.getCssFileNames( widgetName ),
				fileContent = fs.readFileSync( filePath ).toString();

			// Collecting all widgets .scss files that has @media queries in order to create templates files for custom breakpoints.
			if ( fileContent.indexOf( '@media' ) > -1 ) {
				this.responsiveWidgets.push( defaultFilename, rtlFilename );
			}
		} );

		this.createResponsiveWidgetsJson( this.responsiveWidgets );

		return this.responsiveWidgets;
	}

	// This method will append to the 'responsive-widgets.json' file created in WidgetsCss.createResponsiveWidgetsJson()
	createResponsiveWidgetsJson( responsiveWidgets ) {
		const responsiveWidgetsJsonFolder = path.resolve( __dirname, '../assets/data' ),
			responsiveWidgetsJsonPath = path.join( responsiveWidgetsJsonFolder, 'responsive-widgets.json' );
	
		let existingResponsiveWidgets = {};
	
		// Check if the JSON file exists and read its contents
		if ( fs.existsSync( responsiveWidgetsJsonPath ) ) {
			const fileContents = fs.readFileSync( responsiveWidgetsJsonPath, 'utf8' );
			try {
				existingResponsiveWidgets = JSON.parse( fileContents );
			} catch ( error ) {
				console.error( 'Error parsing existing responsive-widgets.json:', error );
			}
		}
	
		const modulesResponsiveWidgets = responsiveWidgets.reduce( ( obj, val ) => {
			// No need to save also the -rtl key.
			if ( val.indexOf( '-rtl' ) > -1 ) {
				return obj;
			}
	
			val = val.replace( this.cssFilePrefix, '' ).replace( '.scss', '' );
			return { ...obj, [val]: true };
		}, {} );
	
		// Merge the existing and new responsive widgets
		const mergedResponsiveWidgets = { ...existingResponsiveWidgets, ...modulesResponsiveWidgets };
	
		// Breaking the line for the linter that throws a warning.
		fs.writeFileSync( responsiveWidgetsJsonPath, JSON.stringify( mergedResponsiveWidgets ) );
	}
}

module.exports = ModulesWithWidgetsCss;
