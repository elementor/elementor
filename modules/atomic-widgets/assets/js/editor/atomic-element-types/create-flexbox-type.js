const createFlexboxType = () => {
	const FlexboxView = elementor.modules.elements.views.createAtomicElementBase( 'e-flexbox' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-flexbox', FlexboxView );
};

export default createFlexboxType;
