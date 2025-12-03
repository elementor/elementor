import createAtomicTabsMenuView from './create-atomic-tabs-menu-view';

const createAtomicTabsMenuType = () => {
	const AtomicTabsMenuView = createAtomicTabsMenuView();

	return new elementor.modules.elements.types.AtomicElementBase( 'e-tabs-menu', AtomicTabsMenuView );
};

export default createAtomicTabsMenuType;

