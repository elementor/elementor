import createAtomicFormStatusView from './create-atomic-form-status-view';

const createAtomicFormErrorType = () => {
	return new elementor.modules.elements.types.AtomicElementBase(
		'e-form-error',
		createAtomicFormStatusView( 'error' ),
	);
};

export default createAtomicFormErrorType;
