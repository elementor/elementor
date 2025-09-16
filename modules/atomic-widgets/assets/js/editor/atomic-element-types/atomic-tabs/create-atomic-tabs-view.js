const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default-active-tab' );

			return defaultActiveTab?.value
				? { 'data-active-tab': defaultActiveTab.value, ...super.attributes() }
				: super.attributes();
		}
	};
};

export default createAtomicTabsView;
