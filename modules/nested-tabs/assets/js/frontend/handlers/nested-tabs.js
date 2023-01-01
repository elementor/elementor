export default class NestedTabs extends elementorModules.frontend.handlers.BaseNestedTabs {
	onInit( ...args ) {
		const items = {
			headingClassName: 'e-n-tabs-heading',
			titleClassName: 'e-n-tab-title',
		};

		this.addCollapseClassToItems( args, items );

		super.onInit( ...args );
	}
}
