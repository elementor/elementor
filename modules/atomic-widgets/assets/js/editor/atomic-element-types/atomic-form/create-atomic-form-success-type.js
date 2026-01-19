import createAtomicFormStatusView from './create-atomic-form-status-view';

const createAtomicFormSuccessType = () => {
	return new elementor.modules.elements.types.AtomicElementBase(
		'e-form-success',
		createAtomicFormStatusView( 'success' ),
	);
};

export default createAtomicFormSuccessType;
