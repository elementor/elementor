const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const tabPanelId = this.model.getSetting( 'tab-panel-id' );

			return tabPanelId?.value
				? { 'aria-controls': tabPanelId.value, ...super.attributes() }
				: super.attributes();
		}
	};
};

export default createAtomicTabView;
