import createAtomicTabsContentAreaView from './create-atomic-tabs-content-area-view';

const createAtomicTabsContentAreaType = () => {
	const AtomicTabsContentAreaView = createAtomicTabsContentAreaView();

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-content-area', AtomicTabsContentAreaView );
};

export default createAtomicTabsContentAreaType;

