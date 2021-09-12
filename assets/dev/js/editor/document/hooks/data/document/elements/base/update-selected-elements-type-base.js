import After from 'elementor-api/modules/hooks/data/after';

export default class UpdateSelectedElementsTypeBase extends After {
	apply( args ) {
		elementor.selectedElementsType = this.resolveType();
	}

	resolveType() {
		const selectedElements = elementor.getSelectedElements();

		return selectedElements.length && selectedElements.reduce( ( previous, current ) => {
			if ( previous === current.type ) {
				return current.type;
			}

			return false;
		}, selectedElements[ 0 ] );
	}
}
