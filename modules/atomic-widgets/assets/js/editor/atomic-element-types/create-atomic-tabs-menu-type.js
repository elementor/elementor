const createAtomicTabsMenuType = () => {
	const AtomicTabsListView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-menu' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-menu', AtomicTabsListView );
};

export default createAtomicTabsMenuType;

