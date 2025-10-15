import createAtomicTabView from './create-atomic-tabs-view';
import createAtomicTabsModel from './create-atomic-tabs-model';

const createAtomicTabsType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs', createAtomicTabView(), createAtomicTabsModel() );
};

export default createAtomicTabsType;

