export default class ImportDependsManager extends elementorModules.ViewModule {

	onInit() {
		this.activeModuleScripts = this.getActiveModuleScripts();
	}

	getActiveModuleScripts() {
		return ! elementorFrontend.isEditMode() && !! elementorDynamicImports ? elementorDynamicImports : [];
	}

	load( objectName, frontendObject ) {
		const importDepends = this.activeModuleScripts[ objectName ];

		if ( ! importDepends ) {
			return;
		}

		for ( const importKey of Object.keys( importDepends ) ) {
			const dynamicImport = importDepends[ importKey ];
			const importFunction = () => import( /* webpackChunkName: dynamicImport.webpackChunkName */ `${ dynamicImport.path }` );

			frontendObject.push( () => importFunction() );
		}
	}

	async loadAsync( objectName, frontendObject ) {
		const importDepends = this.activeModuleScripts[ objectName ];

		if ( ! importDepends ) {
			return;
		}

		for ( const importKey of Object.keys( importDepends ) ) {
			const dynamicImport = importDepends[ importKey ];
			const importFunction = () => import( /* webpackChunkName: dynamicImport.webpackChunkName */ `${ dynamicImport.path }` );
			const importClass = ( await importFunction() ).default;

			frontendObject[ importKey ] = dynamicImport.hasOwnProperty( 'initializeClass' ) && dynamicImport?.initializeClass
				? new importClass()
				: importClass;
		}
	}
}
