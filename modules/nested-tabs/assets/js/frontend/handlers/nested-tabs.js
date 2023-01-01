import BaseNestedTabs from '../../base-nested-tabs';

export default class NestedTabs extends BaseNestedTabs {
	getTabContentFilterSelector( tabIndex ) {
		// Double by 2, since each `e-con` should have 'e-collapse'.
		return `*:nth-child(${ tabIndex * 2 })`;
	}

	onInit( ...args ) {
		this.addCollapseClassToItems( args );

		super.onInit( ...args );
	}
}
