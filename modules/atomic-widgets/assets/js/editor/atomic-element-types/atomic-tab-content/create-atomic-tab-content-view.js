const createAtomicTabContentView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-content' );

	return class AtomicTabContentView extends AtomicElementBaseView {
		attributes() {
			const attributes = super.attributes();

			return { 'x-bind': 'tabContent', ...attributes };
		}
	};
};

export default createAtomicTabContentView;
