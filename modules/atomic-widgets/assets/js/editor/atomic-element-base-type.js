export default class AtomicElementBaseType extends elementor.modules.elements.types.Base {
	constructor( elementType, viewClass, modelClass = null, emptyViewClass = null ) {
		super();
		this.elementType = elementType;
		this.viewClass = viewClass;
		this.modelClass = modelClass;
		this.emptyViewClass = emptyViewClass;
	}

	getType() {
		return this.elementType;
	}

	getView() {
		return this.viewClass;
	}

	getEmptyView() {
		return this.emptyViewClass || elementor.modules.elements.views.EmptyComponent;
	}

	getModel() {
		return this.modelClass || elementor.modules.elements.models.AtomicElementBase;
	}
}

