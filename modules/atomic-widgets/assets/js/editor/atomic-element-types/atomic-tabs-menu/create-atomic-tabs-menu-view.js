const createAtomicTabsMenuView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-menu' );

	return class AtomicTabsMenuView extends BaseView {
		getChildType() {
			return [ 'e-tab', 'container' ];
		}
	};
};

export default createAtomicTabsMenuView;

