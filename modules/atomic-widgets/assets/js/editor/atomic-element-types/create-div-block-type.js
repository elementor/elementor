const createDivBlockType = () => {
	const DivBlockView = elementor.modules.elements.views.createAtomicElementBase( 'e-div-block' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-div-block', DivBlockView );
};

export default createDivBlockType;
