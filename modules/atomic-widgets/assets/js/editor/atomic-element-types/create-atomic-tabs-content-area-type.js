const createAtomicTabsContentAreaType = () => {
	const AtomicTabsContentView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-content-area' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-content-area', AtomicTabsContentView );
};

export default createAtomicTabsContentAreaType;
