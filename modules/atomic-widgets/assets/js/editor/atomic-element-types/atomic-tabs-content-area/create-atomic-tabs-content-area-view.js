const createAtomicTabsContentAreaView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-content-area' );

	return class AtomicTabsContentAreaView extends BaseView {
		initialize() {
			super.initialize();

			if ( this.collection ) {
				this.listenTo( this.collection, 'update', this.onChildrenChanged );
			}
		}

		onChildrenChanged() {
			this.render();
		}

		getChildType() {
			return [ 'e-tab-content', 'container' ];
		}
	};
};

export default createAtomicTabsContentAreaView;

