const createFormMessageType = ( type ) => {
	const View = elementor.modules.elements.views.createAtomicElementBase( type );

	return new elementor.modules.elements.types.AtomicElementBase( type, View );
};

export default createFormMessageType;
