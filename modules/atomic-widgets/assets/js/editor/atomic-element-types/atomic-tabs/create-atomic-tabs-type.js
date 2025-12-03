import createAtomicTabView from './create-atomic-tabs-view';

const createAtomicTabsType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs', createAtomicTabView() );
};

export default createAtomicTabsType;

