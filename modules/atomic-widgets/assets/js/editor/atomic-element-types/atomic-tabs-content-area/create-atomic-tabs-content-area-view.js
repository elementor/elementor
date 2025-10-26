const createAtomicTabsContentAreaView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-content-area' );

	return class AtomicTabsContentAreaView extends BaseView {
		initialize() {
			super.initialize();

			if ( this.collection ) {
				this.listenTo( this.collection, 'add remove reset sort', this.onChildrenChanged );
			}
		}

		onChildrenChanged() {
			this.render();
		}
	};
};

export default createAtomicTabsContentAreaView;

