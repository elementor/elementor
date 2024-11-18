export default class DynamicModuleImportManager extends elementorModules.ViewModule {
	getRegisteredModuleScripts() {
		return [
			{
				moduleKey: 'carousel-base',
				moduleName: 'CarouselBase',
				frontendObject: 'frontend-handlers',
				importFunction: () => import( /* webpackChunkName: 'carouselBaseHandler' */ './handlers/base-carousel' ),
			},
		];
	}

	getActiveModuleScripts() {
		return !! elementorScriptModuleImports ? elementorScriptModuleImports : [];
	}

	getFrontendObject( objectName ) {
		let frontendObject = null;

		switch ( objectName ) {
			case 'frontend-handlers':
				frontendObject = elementorModules.frontend.handlers;
				break;
			case 'utils':
				frontendObject = elementorFrontend.utils;
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
		this.registeredModuleScripts.forEach( ( script ) => {
			if ( this.activeModuleScripts.includes( script.moduleKey ) ) {
				( async () => {
					const { default: ScriptModule } = await script.importFunction();

					const frontendObject = this.getFrontendObject( script.frontendObject );
					frontendObject[ script.moduleName ] = ScriptModule;
				} )();
			}
		} );
	}
}
