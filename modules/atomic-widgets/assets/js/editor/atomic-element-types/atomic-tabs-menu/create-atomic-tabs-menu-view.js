const createAtomicTabsMenuView = () => {
	const BaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs-menu' );

	return class AtomicTabsMenuView extends BaseView {
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

export default createAtomicTabsMenuView;

