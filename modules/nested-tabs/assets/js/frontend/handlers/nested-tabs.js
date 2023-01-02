export default class NestedTabs extends elementorModules.frontend.handlers.BaseNestedTabs {
	onInit( ...args ) {
		this.addCollapseClassToItems( args );

		super.onInit( ...args );
	}
}
