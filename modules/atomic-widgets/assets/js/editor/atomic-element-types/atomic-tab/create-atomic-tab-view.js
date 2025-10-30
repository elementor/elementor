const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const tabContentId = this.model.getSetting( 'tab-content-id' );

			return tabContentId?.value
				? { 'aria-controls': tabContentId.value, ...super.attributes() }
				: super.attributes();
		}
	};
};

export default createAtomicTabView;
