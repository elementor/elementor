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
		return ! elementorFrontend.isEditMode() && !! elementorScriptModuleImports ? elementorScriptModuleImports : [];
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
		const isVersionBefore328 = true;

		this.registeredModuleScripts.forEach( ( script ) => {
			if ( isVersionBefore328 || elementorFrontend.isEditMode() || this.activeModuleScripts.includes( script.moduleKey ) ) {
				( async () => {
					const { default: ScriptModule } = await script.importFunction();

					const frontendObject = this.getFrontendObject( script.frontendObject );
					frontendObject[ script.moduleName ] = ScriptModule;
				} )();
			}
		} );
	}
}
