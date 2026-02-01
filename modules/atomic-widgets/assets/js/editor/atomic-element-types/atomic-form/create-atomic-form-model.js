const createAtomicFormModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicFormModel extends AtomicElementBaseModel {
		isValidChild( childModel ) {
			if ( ! super.isValidChild( childModel ) ) {
				return false;
			}

			const elType = childModel.get( 'elType' );
			const widgetType = childModel.get( 'widgetType' );
			const childType = widgetType || elType;

			return childType !== 'e-form';
		}
	};
};

export default createAtomicFormModel;
