const createAtomicTabContentView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-content' );

	return class AtomicTabContentView extends AtomicElementBaseView {
		attributes() {
			const index = this.model.collection.indexOf( this.model );

			const attributes = super.attributes();

			return { 'x-bind': 'tabContent', 'data-tab-index': index, ...attributes };
		}
	};
};

export default createAtomicTabContentView;
