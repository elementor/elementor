import createAtomicTabView from './create-atomic-tab-view';

const createAtomicTabType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tab', createAtomicTabView() );
};

export default createAtomicTabType;
