export default class NestedTabs extends elementorModules.frontend.handlers.BaseNestedTabs {
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con` should have 'e-collapse'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	onInit( ...args ) {
		const items = {
			headingClassName: 'e-n-tabs-heading',
			titleClassName: 'e-n-tab-title',
		};

		this.addCollapseClassToItems( args );

		super.onInit( ...args );
	}
}
