const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default-active-tab' );

			const attributes = super.attributes();

			return defaultActiveTab?.value
				? { 'x-data': 'atomicTabs', 'data-active-tab': defaultActiveTab.value, ...attributes }
				: attributes;
		}
	};
};

export default createAtomicTabsView;
