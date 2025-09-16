import createAtomicTabPanelView from './create-atomic-tab-panel-view';

const createAtomicTabPanelType = () => {
	return new elementor.modules.elements.types.AtomicElementBase( 'e-tab-panel', createAtomicTabPanelView() );
};

export default createAtomicTabPanelType;
