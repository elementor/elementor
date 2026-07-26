import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync, existsSync, lstatSync } from 'node:fs';
import { dirname, join } from 'node:path';

export class WidgetsCss {
	constructor( {
		env = 'production',
		sourceScssFolder,
		sourceModulesScssFolder,
		tempScssFolder,
		templatesCssFolder,
		cssDestinationFolder,
		responsiveWidgetsJsonFolder,
	} ) {
		this.env = env;
		this.responsiveWidgets = undefined;
		this.widgetsScssFilesList = undefined;
		this.cssFilePrefix = 'widget-';
		this.sourceScssFolder = sourceScssFolder;
		this.sourceModulesScssFolder = sourceModulesScssFolder;
		this.tempScssFolder = tempScssFolder;
		this.templatesCssFolder = templatesCssFolder;
		this.cssDestinationFolder = cssDestinationFolder;
		this.responsiveWidgetsJsonFolder = responsiveWidgetsJsonFolder;
	}

	createWidgetsTempScssFiles() {
		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		mkdirSync( this.tempScssFolder, { recursive: true } );

		widgetsCssFilesList.forEach( ( item ) => {
			const widgetScssFileDest = join( this.tempScssFolder, item.defaultFilename );
			const widgetScssRtlFileDest = join( this.tempScssFolder, item.rtlFilename );

			writeFileSync( widgetScssFileDest, this.getWidgetScssContent( item.importPath, 'ltr' ) );
			writeFileSync( widgetScssRtlFileDest, this.getWidgetScssContent( item.importPath, 'rtl' ) );
		} );
	}

	getWidgetScssContent( importPath, direction ) {
		return `$direction: ${ direction };

@import "../../../../assets/dev/scss/helpers/variables";
@import "../../../../assets/dev/scss/helpers/mixins";
@import "../../../../assets/dev/scss/frontend/breakpoints/proxy";

@import "${ importPath }";
`;
	}

	removeWidgetsUnusedStyleFiles() {
		const tempFilesFolders = [ this.tempScssFolder, this.cssDestinationFolder, this.templatesCssFolder ];

		tempFilesFolders.forEach( ( folder ) => {
			if ( ! existsSync( folder ) ) {
				return;
			}

			readdirSync( folder ).forEach( ( filename ) => {
				const filePath = join( folder, filename );

				if (
					filename.startsWith( this.cssFilePrefix ) &&
					existsSync( filePath ) &&
					! filename.includes( '.min.css' )
				) {
					unlinkSync( filePath );
				}
			} );
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
		const standAloneWidgetData = [];
		const standAloneWidgetsList = existsSync( this.sourceScssFolder ) ? readdirSync( this.sourceScssFolder ) : [];

		standAloneWidgetsList.forEach( ( filename ) => {
			const widgetName = filename.replace( '.scss', '' );

			standAloneWidgetData.push( {
				widgetName,
				defaultFilename: `${ this.cssFilePrefix }${ filename }`,
				rtlFilename: `${ this.cssFilePrefix }${ filename.replace( '.scss', '-rtl.scss' ) }`,
				importPath: `../frontend/widgets/${ widgetName }`,
				filePath: join( this.sourceScssFolder, filename ),
				cssFileName: `${ this.cssFilePrefix }${ widgetName }`,
			} );
		} );

		return standAloneWidgetData;
	}

	getModulesFrontendScssFiles( filePath, frontendScssFiles = [] ) {
		readdirSync( filePath ).forEach( ( fileName ) => {
			const fileFullPath = join( filePath, fileName );
			const isFrontendScssFile = fileName.includes( 'frontend.scss' );
			const isWidgetsScssFile = fileName.includes( '.scss' ) && filePath.includes( '/widgets' );

			if ( lstatSync( fileFullPath ).isDirectory() ) {
				this.getModulesFrontendScssFiles( fileFullPath, frontendScssFiles );
			} else if ( isFrontendScssFile || isWidgetsScssFile ) {
				frontendScssFiles.push( fileFullPath );
			}
		} );

		return frontendScssFiles;
	}

	getWidgetDataFromPath( baseFolder, filePath, isFrontendScssFile = false ) {
		const normalizedPath = filePath.replace( baseFolder, '' ).substring( 1 );
		const extension = normalizedPath.endsWith( '.min.css' ) ? '.min.css' : filePath.slice( filePath.lastIndexOf( '.' ) );
		const widgetName = isFrontendScssFile
			? normalizedPath.split( '/' )[ 0 ]
			: filePath.slice( filePath.lastIndexOf( '/' ) + 1, filePath.lastIndexOf( extension ) );

		return {
			path: normalizedPath.replace( /\\/g, '/' ),
			name: widgetName,
		};
	}

	getModulesWidgetsCssFilesList() {
		const moduleWidgetData = [];
		const moduleWidgetsList = this.getModulesFrontendScssFiles( this.sourceModulesScssFolder );

		moduleWidgetsList.forEach( ( filePath ) => {
			const isFrontendScssFile = filePath.includes( 'frontend.scss' );
			const widgetData = this.getWidgetDataFromPath( this.sourceModulesScssFolder, filePath, isFrontendScssFile );

			moduleWidgetData.push( {
				widgetName: widgetData.name,
				defaultFilename: `${ this.cssFilePrefix }${ widgetData.name }.scss`,
				rtlFilename: `${ this.cssFilePrefix }${ widgetData.name }-rtl.scss`,
				importPath: `../../../../modules/${ widgetData.path }`,
				filePath,
				cssFileName: `${ this.cssFilePrefix }${ widgetData.name }`,
			} );
		} );

		return moduleWidgetData;
	}

	getResponsiveWidgetsList() {
		if ( Array.isArray( this.responsiveWidgets ) ) {
			return this.responsiveWidgets;
		}

		this.responsiveWidgets = [];
		const widgetsCssFilesList = this.getWidgetsCssFilesList();

		widgetsCssFilesList.forEach( ( item ) => {
			const widgetSourceFilePath = join( this.cssDestinationFolder, `${ item.cssFileName }.min.css` );

			if ( ! existsSync( widgetSourceFilePath ) ) {
				return;
			}

			const fileContent = readFileSync( widgetSourceFilePath, 'utf8' );

			if ( fileContent.includes( '@media' ) ) {
				this.responsiveWidgets.push( item.defaultFilename, item.rtlFilename );
			}
		} );

		this.createResponsiveWidgetsJson( this.responsiveWidgets );
		return this.responsiveWidgets;
	}

	createResponsiveWidgetsJson( responsiveWidgets ) {
		mkdirSync( this.responsiveWidgetsJsonFolder, { recursive: true } );

		const responsiveWidgetsJsonPath = join( this.responsiveWidgetsJsonFolder, 'responsive-widgets.json' );
		const responsiveWidgetsObject = responsiveWidgets.reduce( ( obj, val ) => {
			if ( val.includes( '-rtl' ) ) {
				return obj;
			}

			const key = val.replace( this.cssFilePrefix, '' ).replace( '.scss', '' );
			return { ...obj, [ key ]: true };
		}, {} );

		writeFileSync( responsiveWidgetsJsonPath, `${ JSON.stringify( responsiveWidgetsObject ) }\n` );
	}
}
