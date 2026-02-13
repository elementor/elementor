const createFormErrorMessageType = () => {
	const View = elementor.modules.elements.views.createAtomicElementBase( 'e-form-error-message' );

	return new elementor.modules.elements.types.AtomicElementBase( 'e-form-error-message', View );
};

export default createFormErrorMessageType;
