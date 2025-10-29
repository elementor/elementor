const createAtomicTabsMenuView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-menu' );

	return class AtomicTabsMenuView extends BaseView {
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
			return [ 'e-tab', 'container' ];
		}
	};
};

export default createAtomicTabsMenuView;

