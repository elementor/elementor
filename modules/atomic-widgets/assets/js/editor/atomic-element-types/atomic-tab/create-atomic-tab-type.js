import createAtomicTabView from './create-atomic-tab-view';
import createAtomicTabModel from './create-atomic-tab-model';

const createAtomicTabType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tab', createAtomicTabView(), createAtomicTabModel() );
};

export default createAtomicTabType;
