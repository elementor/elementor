const createAtomicFormView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-form' );

	return class AtomicFormView extends AtomicElementBaseView {
		getChildType() {
			const childTypes = super.getChildType();

			return childTypes.filter( ( type ) => type !== 'e-form' );
		}
	};
};

export default createAtomicFormView;
