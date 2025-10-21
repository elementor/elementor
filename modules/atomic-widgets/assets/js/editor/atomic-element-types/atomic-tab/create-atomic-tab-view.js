const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const index = this.model.collection.indexOf( this.model );

			const attributes = super.attributes();

			return { 'x-bind': 'tab', 'data-tab-index': index, ...attributes };
		}
	};
};

export default createAtomicTabView;
