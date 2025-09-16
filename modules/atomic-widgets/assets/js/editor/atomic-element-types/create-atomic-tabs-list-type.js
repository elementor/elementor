const createAtomicTabsListType = () => {
	const AtomicTabsListView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-list' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-list', AtomicTabsListView );
};

export default createAtomicTabsListType;

