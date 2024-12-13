export default class ImportDependsManager extends elementorModules.ViewModule {
	getRegisteredModuleScripts() {
		return [
			{
				moduleKey: 'carousel-base',
				moduleName: 'CarouselBase',
				frontendObject: 'frontendHandlers',
				importFunction: () => import( /* webpackChunkName: 'carouselBaseHandler' */ './handlers/base-carousel' ),
			},
			{
				moduleKey: 'swiper-base',
				moduleName: 'SwiperBase',
				frontendObject: 'frontendHandlers',
				importFunction: () => import( /* webpackChunkName: 'swiperBaseHandler' */ './handlers/base-swiper' ),
			},
			// {
			// 	moduleKey: 'background-slideshow',
			// 	moduleName: 'BackgroundSlideshow',
			// 	frontendObject: 'container',
			// 	importFunction: () => import( /* webpackChunkName: 'swiperBaseHandler' */ './handlers/background-slideshow' ),
			// },
			{
				moduleKey: 'e-swiper',
				moduleName: 'swiper',
				frontendObject: 'utils',
				importFunction: () => import( /* webpackChunkName: 'swiperClass' */ './utils/swiper' ),
			},
		];
	}

	getRegisteredScriptsByObjectName( objectName ) {
		const registeredScripts = this.getRegisteredModuleScripts();
		return registeredScripts.filter( ( script ) => script.frontendObject === objectName );
	}

	getActiveModuleScripts() {
		return ! elementorFrontend.isEditMode() && !! elementorDynamicImports ? elementorDynamicImports : [];
	}

	getFrontendObject( objectName ) {
		let frontendObject = null;

		switch ( objectName ) {
			case 'frontendHandlers':
				frontendObject = elementorModules.frontend.handlers;
				break;
			case 'utils':
				frontendObject = elementorFrontend.utils;
				break;
			case 'container':
				frontendObject = this.elementsHandlers.container;
				break;
		}

		return frontendObject;
	}

	onInit() {
		this.registeredModuleScripts = this.getRegisteredModuleScripts();
		this.activeModuleScripts = this.getActiveModuleScripts();
		this.loadActiveModuleScripts();
	}

	loadActiveModuleScripts() {
		// TODO: Remove this in version 3.28 [ED-15983].
		const areAllScriptsLoadedByDefault = true;

		this.registeredModuleScripts.forEach( ( script ) => {
			if ( areAllScriptsLoadedByDefault || elementorFrontend.isEditMode() || this.activeModuleScripts.includes( script.moduleKey ) ) {
				( async () => {
					const { default: ScriptModule } = await script.importFunction();

					const frontendObject = this.getFrontendObject( script.frontendObject );
					frontendObject[ script.moduleName ] = ScriptModule;
				} )();
			}
		} );
	}

	async load( objectName, frontendObject ) {
		const importDepends = this.getRegisteredScriptsByObjectName( objectName );

		// TODO: Remove this in version 3.28 [ED-15983].
		const areAllScriptsLoadedByDefault = false;

		for ( const script of importDepends ) {
			if (
				areAllScriptsLoadedByDefault ||
				elementorFrontend.isEditMode() ||
				this.activeModuleScripts.includes( script.moduleKey )
			) {
				frontendObject[ script.moduleName ] = await script.importFunction();
			}
		}
	}
}
