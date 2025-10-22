const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default-active-tab' );
            const eSettings = JSON.stringify( { 'default-active-tab': defaultActiveTab ?? 0 } );

			return { 'x-data': 'atomicTabs', 'data-e-settings': eSettings, ...attributes };
		}
	};
};

export default createAtomicTabsView;
