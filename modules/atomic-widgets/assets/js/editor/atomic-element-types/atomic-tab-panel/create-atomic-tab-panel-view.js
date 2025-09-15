const createAtomicTabPanelView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-panel' );

	return class AtomicTabPanelView extends AtomicElementBaseView {
		attributes() {
			const tabId = this.model.getSetting( 'tab_id' );

			return tabId?.value
				? { 'aria-labelledby': tabId.value, ...super.attributes() }
				: super.attributes();
		}
	};
};

export default createAtomicTabPanelView;
