export default class DynamicModuleImportManager extends elementorModules.ViewModule {
	getRegisteredModuleScripts() {
		return [
			{
				key: 'carousel-base',
				jsObject: 'frontend-handlers',
				moduleName: 'CarouselBase',
				importValue: () => import( /* webpackChunkName: 'carouselBaseHandler' */ './handlers/base-carousel' ),
			},
		];
	}

	getActiveModuleScripts() {
		return !! elementorScriptModuleImports ? elementorScriptModuleImports : [];
	}

	onInit() {
		this.registeredModuleScripts = this.getRegisteredModuleScripts();
		this.activeModuleScripts = this.getActiveModuleScripts();
		this.loadActiveModuleScripts();
	}

	loadActiveModuleScripts() {
		this.registeredModuleScripts.forEach( ( script ) => {
			if ( this.activeModuleScripts.includes( script.key ) ) {
				( async () => {
					const { default: ScriptModule } = await script.importValue();

					elementorModules.frontend.handlers[ script.moduleName ] = ScriptModule;
				} )();
			}
		} );
	}
}
