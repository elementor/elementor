export default class NestedTabs extends elementorModules.frontend.handlers.BaseNestedTabs {
	onInit( ...args ) {
		this.createMobileTabs( args );

		super.onInit( ...args );
	}
}
