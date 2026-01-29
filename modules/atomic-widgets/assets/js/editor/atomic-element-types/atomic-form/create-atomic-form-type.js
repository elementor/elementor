import createAtomicFormModel from './create-atomic-form-model';
import createAtomicFormView from './create-atomic-form-view';

const createAtomicFormType = () => {
	return new elementor.modules.elements.types.AtomicElementBase(
		'e-form',
		createAtomicFormView(),
		createAtomicFormModel(),
	);
};

export default createAtomicFormType;
