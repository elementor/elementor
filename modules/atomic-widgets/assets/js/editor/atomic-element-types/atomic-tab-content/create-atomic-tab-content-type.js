import createAtomicTabContentView from './create-atomic-tab-content-view';

const createAtomicTabContentType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tab-content', createAtomicTabContentView() );
};

export default createAtomicTabContentType;
