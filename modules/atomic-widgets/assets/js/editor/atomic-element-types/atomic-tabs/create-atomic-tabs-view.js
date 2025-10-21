const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default-active-tab' );

			const attributes = super.attributes();

			return { 'x-data': 'atomicTabs', 'data-active-tab': defaultActiveTab.value ?? 0, ...attributes };
		}
	};
};

export default createAtomicTabsView;
