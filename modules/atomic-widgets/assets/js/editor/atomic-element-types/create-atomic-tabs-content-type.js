const createAtomicTabsContentType = () => {
	const AtomicTabsContentView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-content' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-content', AtomicTabsContentView );
};

export default createAtomicTabsContentType;
