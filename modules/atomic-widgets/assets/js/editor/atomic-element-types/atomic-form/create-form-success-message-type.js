const createFormSuccessMessageType = () => {
	const View = elementor.modules.elements.views.createAtomicElementBase( 'e-form-success-message' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-form-success-message', View );
};

export default createFormSuccessMessageType;
