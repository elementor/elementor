const createAtomicTabContentView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-content' );

	return class AtomicTabContentView extends AtomicElementBaseView {
		attributes() {
			const tabId = this.model.getSetting( 'tab-id' );

			return tabId?.value
				? { 'data-tab-id': tabId.value, 'aria-labelledby': tabId.value, ...super.attributes() }
				: super.attributes();
		}
	};
};

export default createAtomicTabContentView;
