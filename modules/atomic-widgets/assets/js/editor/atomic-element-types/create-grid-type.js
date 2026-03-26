const createGridType = () => {
	const GridView = elementor.modules.elements.views.createAtomicElementBase( 'e-grid' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-grid', GridView );
};

export default createGridType;

