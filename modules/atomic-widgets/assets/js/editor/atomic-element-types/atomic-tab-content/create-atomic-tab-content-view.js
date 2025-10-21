const createAtomicTabContentView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-content' );

	return class AtomicTabContentView extends AtomicElementBaseView {
		attributes() {
			const tabId = this.model.getSetting( 'tab-id' );

			const attributes = super.attributes();

			return tabId?.value
				? { 'x-bind': 'tabContent', 'data-tab-id': tabId.value, ...attributes }
				: attributes;
		}
	};
};

export default createAtomicTabContentView;
