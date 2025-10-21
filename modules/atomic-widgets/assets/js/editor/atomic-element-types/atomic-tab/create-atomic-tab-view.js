const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const tabContentId = this.model.getSetting( 'tab-content-id' );

			const attributes = super.attributes();

			return tabContentId?.value
				? { 'x-bind': 'tab', ...attributes }
				: attributes;
		}
	};
};

export default createAtomicTabView;
