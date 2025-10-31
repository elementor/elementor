const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const attributes = super.attributes();

			return { 'x-bind': 'tab', ...attributes };
		}
	};
};

export default createAtomicTabView;
