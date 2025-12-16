const createAtomicTabsContentAreaView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-content-area' );

	return class AtomicTabsContentAreaView extends BaseView {
		getChildType() {
			return [ 'e-tab-content', 'container' ];
		}
	};
};

export default createAtomicTabsContentAreaView;

